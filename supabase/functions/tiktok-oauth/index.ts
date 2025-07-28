import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  open_id: string;
  refresh_expires_in: number;
}

interface TikTokUserInfo {
  open_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { code, redirect_uri, user_id } = await req.json()

    if (!code || !redirect_uri || !user_id) {
      throw new Error('必要なパラメータが不足しています')
    }

    // TikTok API設定
    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')

    if (!clientKey || !clientSecret) {
      throw new Error('TikTok API設定が不足しています')
    }

    // 1. アクセストークンを取得
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      throw new Error(`TikTokトークン取得エラー: ${errorData}`)
    }

    const tokenData: TikTokTokenResponse = await tokenResponse.json()

    // 2. ユーザー情報を取得
    const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: ['open_id', 'username', 'display_name', 'avatar_url']
      }),
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.text()
      throw new Error(`TikTokユーザー情報取得エラー: ${errorData}`)
    }

    const userData = await userResponse.json()
    const userInfo: TikTokUserInfo = userData.data.user

    // 3. トークンを暗号化（本番環境では適切な暗号化を実装）
    const encryptedAccessToken = btoa(tokenData.access_token) // 簡易暗号化
    const encryptedRefreshToken = btoa(tokenData.refresh_token) // 簡易暗号化

    // 4. データベースに保存
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    // 既存のアカウントを確認
    const { data: existingAccount } = await supabaseClient
      .from('tiktok_accounts')
      .select('id')
      .eq('tiktok_user_id', userInfo.open_id)
      .eq('user_id', user_id)
      .single()

    if (existingAccount) {
      // 既存のアカウントを更新
      const { error: updateError } = await supabaseClient
        .from('tiktok_accounts')
        .update({
          tiktok_username: userInfo.username,
          display_name: userInfo.display_name,
          avatar_url: userInfo.avatar_url,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: expiresAt.toISOString(),
          scope: tokenData.scope.split(','),
          is_active: true,
          last_synced: new Date().toISOString(),
        })
        .eq('id', existingAccount.id)

      if (updateError) throw updateError
    } else {
      // 新しいアカウントを作成
      const { error: insertError } = await supabaseClient
        .from('tiktok_accounts')
        .insert({
          user_id: user_id,
          tiktok_user_id: userInfo.open_id,
          tiktok_username: userInfo.username,
          display_name: userInfo.display_name,
          avatar_url: userInfo.avatar_url,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: expiresAt.toISOString(),
          scope: tokenData.scope.split(','),
          is_active: true,
          last_synced: new Date().toISOString(),
        })

      if (insertError) throw insertError
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          open_id: userInfo.open_id,
          username: userInfo.username,
          display_name: userInfo.display_name,
          avatar_url: userInfo.avatar_url,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('TikTok OAuth エラー:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'TikTok認証に失敗しました'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})