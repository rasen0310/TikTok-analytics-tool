// TikTok APIモッククライアント（開発用）

import type {
  ITikTokClient,
  TikTokUserInfo,
  TikTokVideoListResponse,
  TikTokAnalyticsResponse,
  TikTokVideoInfo,
  TikTokVideoAnalytics,
} from '../../types/tiktok-api';

export class TikTokMockClient implements ITikTokClient {
  private mode: 'development' | 'production' = 'development';

  constructor() {
    console.log('🔧 TikTok Mock Client initialized (Development Mode)');
  }

  getMode(): 'development' | 'production' {
    return this.mode;
  }

  isConfigured(): boolean {
    return true; // モックでは常に設定済み
  }

  async getUserInfo(_userId?: string): Promise<TikTokUserInfo> {
    // 開発用の遅延をシミュレート
    await this.simulateDelay(500, 1000);

    return {
      user_id: 'mock_user_12345',
      username: 'demo_tiktok_user',
      display_name: 'サンプルTikTokユーザー',
      avatar_url: 'https://via.placeholder.com/150',
      follower_count: Math.floor(Math.random() * 100000) + 10000,
      following_count: Math.floor(Math.random() * 1000) + 100,
      likes_count: Math.floor(Math.random() * 1000000) + 50000,
    };
  }

  async getVideoList(params?: {
    cursor?: string;
    max_count?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<TikTokVideoListResponse> {
    await this.simulateDelay(800, 1500);

    const maxCount = params?.max_count || 20;
    const videos: TikTokVideoInfo[] = [];

    // 指定期間のモック動画を生成
    const startDate = params?.start_date ? new Date(params.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = params?.end_date ? new Date(params.end_date) : new Date();

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const videoCount = Math.min(maxCount, Math.max(1, Math.floor(totalDays / 2)));

    for (let i = 0; i < videoCount; i++) {
      const createdAt = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      );

      const viewCount = Math.floor(Math.random() * 500000) + 10000;
      const likeCount = Math.floor(viewCount * (Math.random() * 0.1 + 0.05));
      const commentCount = Math.floor(likeCount * (Math.random() * 0.05 + 0.02));
      const shareCount = Math.floor(likeCount * (Math.random() * 0.15 + 0.05));

      videos.push({
        video_id: `mock_video_${i + 1}_${Date.now()}`,
        title: `サンプル動画 ${i + 1}`,
        description: `これはサンプル用のモック動画です。実際のTikTok APIに接続すると本物のデータが表示されます。`,
        duration: [15, 30, 45, 60, 90][Math.floor(Math.random() * 5)],
        cover_image_url: `https://via.placeholder.com/300x400?text=Video+${i + 1}`,
        video_url: `https://www.tiktok.com/@demo_user/video/mock_${i + 1}`,
        created_at: createdAt.toISOString(),
        view_count: viewCount,
        like_count: likeCount,
        comment_count: commentCount,
        share_count: shareCount,
      });
    }

    // 作成日時でソート（新しい順）
    videos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      videos,
      cursor: params?.cursor ? undefined : 'mock_cursor_next',
      has_more: !params?.cursor && videos.length >= maxCount,
    };
  }

  async getVideoAnalytics(params: {
    video_ids?: string[];
    start_date: string;
    end_date: string;
  }): Promise<TikTokAnalyticsResponse> {
    await this.simulateDelay(1000, 2000);
    
    // 期間中の動画リストを取得
    const videoList = await this.getVideoList({
      start_date: params.start_date,
      end_date: params.end_date,
      max_count: 50,
    });

    const targetVideos = params.video_ids 
      ? videoList.videos.filter(v => params.video_ids!.includes(v.video_id))
      : videoList.videos;

    const analytics: TikTokVideoAnalytics[] = [];
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalNewFollowers = 0;
    let totalWatchTime = 0;

    // 各動画の分析データを生成
    for (const video of targetVideos) {
      const dailyViews = Math.floor(video.view_count / 7); // 1週間で均等分散と仮定
      const dailyLikes = Math.floor(video.like_count / 7);
      const dailyComments = Math.floor(video.comment_count / 7);
      const dailyShares = Math.floor(video.share_count / 7);
      const dailyNewFollowers = Math.floor(Math.random() * 100) + 10;
      const avgWatchTime = Math.floor(Math.random() * 45) + 10;

      const engagementRate = dailyViews > 0 
        ? ((dailyLikes + dailyComments + dailyShares) / dailyViews) * 100 
        : 0;

      const videoAnalytics: TikTokVideoAnalytics = {
        video_id: video.video_id,
        date: video.created_at.split('T')[0],
        view_count: dailyViews,
        like_count: dailyLikes,
        comment_count: dailyComments,
        share_count: dailyShares,
        new_followers: dailyNewFollowers,
        average_watch_time: avgWatchTime,
        engagement_rate: Math.round(engagementRate * 100) / 100,
      };

      analytics.push(videoAnalytics);

      totalViews += video.view_count;
      totalLikes += video.like_count;
      totalComments += video.comment_count;
      totalShares += video.share_count;
      totalNewFollowers += dailyNewFollowers;
      totalWatchTime += avgWatchTime;
    }

    const avgWatchTime = analytics.length > 0 
      ? Math.round((totalWatchTime / analytics.length) * 100) / 100 
      : 0;

    const overallEngagementRate = totalViews > 0 
      ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 
      : 0;

    return {
      analytics,
      summary: {
        total_views: totalViews,
        total_likes: totalLikes,
        total_comments: totalComments,
        total_shares: totalShares,
        total_new_followers: totalNewFollowers,
        average_watch_time: avgWatchTime,
        engagement_rate: Math.round(overallEngagementRate * 100) / 100,
      },
    };
  }

  private async simulateDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}