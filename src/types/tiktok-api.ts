// TikTok API統一インターフェース型定義

export interface TikTokUserInfo {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
}

export interface TikTokVideoInfo {
  video_id: string;
  title?: string;
  description?: string;
  duration: number;
  cover_image_url?: string;
  video_url: string;
  created_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
}

export interface TikTokVideoListResponse {
  videos: TikTokVideoInfo[];
  cursor?: string;
  has_more: boolean;
}

export interface TikTokVideoAnalytics {
  video_id: string;
  date: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  new_followers: number;
  average_watch_time: number;
  engagement_rate: number;
}

export interface TikTokAnalyticsResponse {
  analytics: TikTokVideoAnalytics[];
  summary: {
    total_views: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
    total_new_followers: number;
    average_watch_time: number;
    engagement_rate: number;
  };
}

export interface TikTokAPIConfig {
  clientKey: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  mode: 'development' | 'production';
}

// TikTok APIクライアント共通インターフェース
export interface ITikTokClient {
  getUserInfo(userId?: string): Promise<TikTokUserInfo>;
  getVideoList(params?: {
    cursor?: string;
    max_count?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<TikTokVideoListResponse>;
  getVideoAnalytics(params: {
    video_ids?: string[];
    start_date: string;
    end_date: string;
  }): Promise<TikTokAnalyticsResponse>;
  isConfigured(): boolean;
  getMode(): 'development' | 'production';
}

// API認証エラー
export class TikTokAPIError extends Error {
  public code?: string;
  public statusCode?: number;
  
  constructor(
    message: string,
    code?: string,
    statusCode?: number
  ) {
    super(message);
    this.name = 'TikTokAPIError';
    this.code = code;
    this.statusCode = statusCode;
  }
}