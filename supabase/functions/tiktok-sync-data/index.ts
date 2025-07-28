import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TikTokVideo {
  id: string;
  title: string;
  create_time: number;
  cover_image_url: string;
  duration: number;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
}

interface TikTokVideoListResponse {
  data: {
    videos: TikTokVideo[];
    cursor: number;
    has_more: boolean;
  };
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
      .select('access_token, tiktok_user_id, tiktok_username')
      .eq('id', account_id)
      .eq('user_id', user_id)
      .single()

    if (accountError || !account) {
      throw new Error('TikTokアカウントが見つかりません')
    }

    // アクセストークンを復号化
    const accessToken = atob(account.access_token)

    let allVideos: TikTokVideo[] = []
    let cursor = 0
    let hasMore = true

    // 動画一覧を取得（ページング対応）
    while (hasMore) {
      const response = await fetch('https://open.tiktokapis.com/v2/video/list/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: [
            'id',
            'title',
            'create_time',
            'cover_image_url',
            'duration',
            'view_count',
            'like_count',
            'comment_count',
            'share_count'
          ],
          max_count: 20,
          cursor: cursor
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`TikTok動画取得エラー: ${errorData}`)
      }

      const videoData: TikTokVideoListResponse = await response.json()
      
      if (videoData.data && videoData.data.videos) {
        allVideos = [...allVideos, ...videoData.data.videos]
        cursor = videoData.data.cursor
        hasMore = videoData.data.has_more
      } else {
        hasMore = false
      }

      // API制限を考慮して少し待機
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // データベースに保存
    const videoInserts = allVideos.map(video => {
      const createDate = new Date(video.create_time * 1000)
      
      return {
        user_id: user_id,
        tiktok_account_id: account_id,
        tiktok_video_id: video.id,
        video_url: `https://www.tiktok.com/@${account.tiktok_username}/video/${video.id}`,
        post_date: createDate.toISOString().split('T')[0],
        post_time: createDate.toTimeString().split(' ')[0],
        duration: video.duration,
        views: video.view_count || 0,
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
        new_followers: 0, // TikTok APIでは取得できないため0に設定
        avg_watch_time: Math.round(video.duration * 0.7), // 推定値
        thumbnail_url: video.cover_image_url,
        description: video.title,
      }
    })

    // 既存の動画データを削除して新しいデータを挿入
    await supabaseClient
      .from('tiktok_videos')
      .delete()
      .eq('tiktok_account_id', account_id)

    if (videoInserts.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('tiktok_videos')
        .insert(videoInserts)

      if (insertError) throw insertError
    }

    // アカウントの最終同期時間を更新
    await supabaseClient
      .from('tiktok_accounts')
      .update({ last_synced: new Date().toISOString() })
      .eq('id', account_id)

    return new Response(
      JSON.stringify({
        success: true,
        synced_videos: allVideos.length,
        account_username: account.tiktok_username
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('TikTokデータ同期エラー:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'データの同期に失敗しました'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})