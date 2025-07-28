import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TikTokRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { account_id, user_id } = await req.json()

    if (!account_id || !user_id) {
      throw new Error('必要なパラメータが不足しています')
    }

    // TikTokアカウント情報を取得
    const { data: account, error: accountError } = await supabaseClient
      .from('tiktok_accounts')
      .select('refresh_token')
      .eq('id', account_id)
      .eq('user_id', user_id)
      .single()

    if (accountError || !account) {
      throw new Error('TikTokアカウントが見つかりません')
    }

    // TikTok API設定
    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')

    if (!clientKey || !clientSecret) {
      throw new Error('TikTok API設定が不足しています')
    }

    // リフレッシュトークンを復号化（簡易復号化）
    const refreshToken = atob(account.refresh_token)

    // トークンをリフレッシュ
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`TikTokトークンリフレッシュエラー: ${errorData}`)
    }

    const tokenData: TikTokRefreshResponse = await response.json()

    // 新しいトークンを暗号化
    const encryptedAccessToken = btoa(tokenData.access_token)
    const encryptedRefreshToken = btoa(tokenData.refresh_token)
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    // データベースを更新
    const { error: updateError } = await supabaseClient
      .from('tiktok_accounts')
      .update({
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', account_id)
      .eq('user_id', user_id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        success: true,
        expires_at: expiresAt.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('TikTokトークンリフレッシュエラー:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'トークンのリフレッシュに失敗しました'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})