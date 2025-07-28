// TikTok API自動切り替えクライアント
// 環境変数の有無でモックと本番APIを自動切り替え

import type {
  ITikTokClient,
  TikTokUserInfo,
  TikTokVideoListResponse,
  TikTokAnalyticsResponse,
} from '../../types/tiktok-api';

import { TikTokMockClient } from './mock-client';
import { TikTokAPIClient } from './api-client';

export class TikTokClient implements ITikTokClient {
  private client: ITikTokClient;
  private mode: 'development' | 'production';

  constructor() {
    this.mode = this.detectMode();
    this.client = this.createClient();
    
    console.log(`🔄 TikTok Client initialized in ${this.mode} mode`);
  }

  /**
   * 環境変数からモードを自動検出
   * VITE_TIKTOK_CLIENT_KEYが設定され、かつ有効な値の場合は本番モード
   */
  private detectMode(): 'development' | 'production' {
    const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
    const isConfigured = clientKey && 
                        clientKey.length > 0 && 
                        clientKey !== 'your-client-key' && 
                        clientKey !== 'test-key' &&
                        clientKey !== '実際のClient Keyを入力してください';

    return isConfigured ? 'production' : 'development';
  }

  /**
   * モードに応じて適切なクライアントを作成
   */
  private createClient(): ITikTokClient {
    if (this.mode === 'production') {
      const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
      const accessToken = this.getStoredAccessToken();
      
      return new TikTokAPIClient({
        clientKey,
        accessToken,
      });
    } else {
      return new TikTokMockClient();
    }
  }

  /**
   * 保存されたアクセストークンを取得
   * SupabaseまたはLocalStorageから取得
   */
  private getStoredAccessToken(): string | undefined {
    try {
      // LocalStorageから設定を取得（既存の設定システムと互換性維持）
      const settings = localStorage.getItem('tiktokAnalyticsSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        return parsedSettings.tiktokAccessToken;
      }
    } catch (error) {
      console.warn('Failed to load stored access token:', error);
    }
    
    return undefined;
  }

  getMode(): 'development' | 'production' {
    return this.mode;
  }

  isConfigured(): boolean {
    return this.client.isConfigured();
  }

  async getUserInfo(userId?: string): Promise<TikTokUserInfo> {
    try {
      return await this.client.getUserInfo(userId);
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw error;
    }
  }

  async getVideoList(params?: {
    cursor?: string;
    max_count?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<TikTokVideoListResponse> {
    try {
      return await this.client.getVideoList(params);
    } catch (error) {
      console.error('Failed to get video list:', error);
      throw error;
    }
  }

  async getVideoAnalytics(params: {
    video_ids?: string[];
    start_date: string;
    end_date: string;
  }): Promise<TikTokAnalyticsResponse> {
    try {
      return await this.client.getVideoAnalytics(params);
    } catch (error) {
      console.error('Failed to get video analytics:', error);
      throw error;
    }
  }

  /**
   * 設定変更時にクライアントを再初期化
   * 設定ページでAPIキーが設定された場合などに使用
   */
  reinitialize(): void {
    console.log('🔄 Reinitializing TikTok Client...');
    this.mode = this.detectMode();
    this.client = this.createClient();
    console.log(`🔄 TikTok Client reinitialized in ${this.mode} mode`);
  }

  /**
   * 現在のクライアント状態を取得（デバッグ用）
   */
  getStatus() {
    return {
      mode: this.mode,
      configured: this.isConfigured(),
      clientType: this.client.constructor.name,
      hasClientKey: !!(import.meta.env.VITE_TIKTOK_CLIENT_KEY),
      hasAccessToken: !!this.getStoredAccessToken(),
    };
  }
}

// シングルトンインスタンスをエクスポート
export const tiktokClient = new TikTokClient();

// 型エクスポート
export type {
  ITikTokClient,
  TikTokUserInfo,
  TikTokVideoListResponse,
  TikTokAnalyticsResponse,
} from '../../types/tiktok-api';

// エラークラスエクスポート
export { TikTokAPIError } from '../../types/tiktok-api';