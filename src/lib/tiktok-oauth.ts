import { TikTokOAuthConfig, TikTokTokenResponse, TikTokUser, TikTokOAuthError } from '../types/tiktok-oauth';

export class TikTokOAuth {
  private config: TikTokOAuthConfig;
  private readonly BASE_URL = 'https://www.tiktok.com/v2/auth/authorize';
  private readonly TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
  private readonly USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/';

  constructor(config: TikTokOAuthConfig) {
    this.config = config;
  }

  /**
   * 認証URLを生成
   */
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_key: this.config.clientKey,
      scope: this.config.scope.join(','),
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      state: state || this.generateState(),
    });

    return `${this.BASE_URL}?${params.toString()}`;
  }

  /**
   * 認証コードからアクセストークンを取得
   */
  async exchangeCodeForToken(code: string): Promise<TikTokTokenResponse> {
    try {
      const response = await fetch(this.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
        body: new URLSearchParams({
          client_key: this.config.clientKey,
          client_secret: this.config.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new TikTokOAuthError(
          `Token exchange failed: ${errorData.error_description || errorData.error}`,
          errorData.error,
          response.status
        );
      }

      const tokenData = await response.json();
      return tokenData.data;
    } catch (error) {
      if (error instanceof TikTokOAuthError) {
        throw error;
      }
      throw new TikTokOAuthError(`Network error during token exchange: ${error}`);
    }
  }

  /**
   * アクセストークンを使用してユーザー情報を取得
   */
  async getUserInfo(accessToken: string): Promise<TikTokUser> {
    try {
      const response = await fetch(this.USER_INFO_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: [
            'open_id',
            'union_id',
            'avatar_url',
            'avatar_url_100',
            'avatar_url_200',
            'display_name',
            'bio_description',
            'profile_deep_link',
            'is_verified',
            'follower_count',
            'following_count',
            'likes_count',
            'video_count'
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new TikTokOAuthError(
          `User info fetch failed: ${errorData.error?.message || 'Unknown error'}`,
          errorData.error?.code,
          response.status
        );
      }

      const userData = await response.json();
      return userData.data.user;
    } catch (error) {
      if (error instanceof TikTokOAuthError) {
        throw error;
      }
      throw new TikTokOAuthError(`Network error during user info fetch: ${error}`);
    }
  }

  /**
   * リフレッシュトークンを使用してアクセストークンを更新
   */
  async refreshAccessToken(refreshToken: string): Promise<TikTokTokenResponse> {
    try {
      const response = await fetch(this.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
        body: new URLSearchParams({
          client_key: this.config.clientKey,
          client_secret: this.config.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new TikTokOAuthError(
          `Token refresh failed: ${errorData.error_description || errorData.error}`,
          errorData.error,
          response.status
        );
      }

      const tokenData = await response.json();
      return tokenData.data;
    } catch (error) {
      if (error instanceof TikTokOAuthError) {
        throw error;
      }
      throw new TikTokOAuthError(`Network error during token refresh: ${error}`);
    }
  }

  /**
   * ランダムなstate文字列を生成
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * トークンの有効期限をチェック
   */
  isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }

  /**
   * 設定を取得
   */
  getConfig(): TikTokOAuthConfig {
    return { ...this.config };
  }

  /**
   * 設定を更新
   */
  updateConfig(newConfig: Partial<TikTokOAuthConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// デフォルトの設定でインスタンスを作成
export const createTikTokOAuth = (): TikTokOAuth => {
  const config: TikTokOAuthConfig = {
    clientKey: import.meta.env.VITE_TIKTOK_CLIENT_KEY || '',
    clientSecret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET || '',
    redirectUri: import.meta.env.VITE_TIKTOK_REDIRECT_URI || `${window.location.origin}/auth/tiktok/callback`,
    scope: [
      'user.info.basic',
      'user.info.profile',
      'video.list'
    ],
  };

  return new TikTokOAuth(config);
};