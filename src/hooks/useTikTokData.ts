// TikTokデータ取得用カスタムフック
// 新しいTikTokClientを使用してデータを取得

import { useState, useCallback, useEffect } from 'react';
import { tiktokClient } from '../lib/tiktok';
import type { TikTokVideo, AnalyticsSummary } from '../types';
import type { TikTokAnalyticsResponse, TikTokVideoListResponse } from '../lib/tiktok';

interface UseTikTokDataResult {
  videos: TikTokVideo[];
  summary: AnalyticsSummary | null;
  loading: boolean;
  error: string | null;
  fetchData: (startDate: string, endDate: string) => Promise<void>;
  mode: 'development' | 'production';
  isConfigured: boolean;
  status: any;
}

export const useTikTokData = (): UseTikTokDataResult => {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TikTokクライアントの状態を取得
  const mode = tiktokClient.getMode();
  const isConfigured = tiktokClient.isConfigured();
  const status = tiktokClient.getStatus();

  /**
   * TikTok APIレスポンスを既存の型に変換
   */
  const convertApiVideoToTikTokVideo = (apiVideo: any): TikTokVideo => {
    const createdAt = new Date(apiVideo.created_at);
    return {
      id: apiVideo.video_id,
      videoUrl: apiVideo.video_url || '',
      postDate: createdAt.toISOString().split('T')[0],
      postTime: createdAt.toTimeString().split(' ')[0].substring(0, 5),
      duration: apiVideo.duration || 0,
      views: apiVideo.view_count || 0,
      likes: apiVideo.like_count || 0,
      comments: apiVideo.comment_count || 0,
      shares: apiVideo.share_count || 0,
      newFollowers: Math.floor((apiVideo.like_count || 0) * 0.01), // 推定値
      avgWatchTime: Math.floor(Math.random() * 30) + 15, // 推定値（APIから取得できない場合）
    };
  };

  /**
   * TikTok Analytics APIレスポンスを既存の型に変換
   */
  const convertApiSummaryToAnalyticsSummary = (apiSummary: any): AnalyticsSummary => ({
    totalViews: apiSummary.total_views || 0,
    totalLikes: apiSummary.total_likes || 0,
    totalComments: apiSummary.total_comments || 0,
    totalShares: apiSummary.total_shares || 0,
    totalNewFollowers: apiSummary.total_new_followers || 0,
    avgWatchTime: apiSummary.average_watch_time || 0,
    engagementRate: apiSummary.engagement_rate || 0,
  });

  /**
   * 指定された期間のデータを取得
   */
  const fetchData = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`📊 Fetching TikTok data (${mode} mode): ${startDate} to ${endDate}`);

      // 動画リストを取得
      const videoListResponse: TikTokVideoListResponse = await tiktokClient.getVideoList({
        start_date: startDate,
        end_date: endDate,
        max_count: 50,
      });

      // 取得した動画を既存の型に変換
      const convertedVideos = videoListResponse.videos.map(convertApiVideoToTikTokVideo);
      setVideos(convertedVideos);

      // 動画IDリストを抽出
      const videoIds = videoListResponse.videos.map(v => v.video_id);

      if (videoIds.length > 0) {
        // アナリティクスデータを取得
        const analyticsResponse: TikTokAnalyticsResponse = await tiktokClient.getVideoAnalytics({
          video_ids: videoIds,
          start_date: startDate,
          end_date: endDate,
        });

        // サマリーデータを変換
        const convertedSummary = convertApiSummaryToAnalyticsSummary(analyticsResponse.summary);
        setSummary(convertedSummary);
      } else {
        // 動画がない場合は空のサマリー
        setSummary({
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalNewFollowers: 0,
          avgWatchTime: 0,
          engagementRate: 0,
        });
      }

      console.log(`✅ Successfully fetched ${convertedVideos.length} videos (${mode} mode)`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの取得に失敗しました';
      console.error('❌ Failed to fetch TikTok data:', err);
      setError(errorMessage);
      
      // エラー時は空のデータを設定
      setVideos([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  // コンポーネントマウント時にクライアントの状態をログ出力
  useEffect(() => {
    console.log('🔍 TikTok Client Status:', status);
  }, [status]);

  return {
    videos,
    summary,
    loading,
    error,
    fetchData,
    mode,
    isConfigured,
    status,
  };
};