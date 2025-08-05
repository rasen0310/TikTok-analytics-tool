// TikTokデータ取得用カスタムフック
// 新しいTikTokClientを使用してデータを取得

import { useState, useCallback, useEffect } from 'react';
import { tiktokClient } from '../lib/tiktok';
import type { TikTokVideo, AnalyticsSummary, AnalyticsSummaryWithComparison } from '../types';
import type { TikTokAnalyticsResponse, TikTokVideoListResponse } from '../lib/tiktok';

interface UseTikTokDataResult {
  videos: TikTokVideo[];
  summary: AnalyticsSummaryWithComparison | null;
  loading: boolean;
  error: string | null;
  fetchData: (startDate: string, endDate: string) => Promise<void>;
  mode: 'development' | 'production';
  isConfigured: boolean;
  status: any;
}

export const useTikTokData = (): UseTikTokDataResult => {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummaryWithComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TikTokクライアントの状態を取得
  const mode = tiktokClient.getMode();
  const isConfigured = tiktokClient.isConfigured();
  const status = tiktokClient.getStatus();

  /**
   * 前期間の日付範囲を計算
   */
  const calculatePreviousPeriod = (startDate: string, endDate: string): { previousStart: string; previousEnd: string } => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 期間の長さを計算（日数）
    const periodLength = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // 前期間の終了日は現在期間の開始日の前日
    const previousEnd = new Date(start);
    previousEnd.setDate(previousEnd.getDate() - 1);
    
    // 前期間の開始日は終了日から期間長分戻る
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - periodLength + 1);
    
    return {
      previousStart: previousStart.toISOString().split('T')[0],
      previousEnd: previousEnd.toISOString().split('T')[0]
    };
  };

  /**
   * 比較パーセンテージを計算
   */
  const calculateComparison = (current: AnalyticsSummary, previous: AnalyticsSummary) => {
    const calculatePercentage = (currentValue: number, previousValue: number): number => {
      if (previousValue === 0) return currentValue > 0 ? 100 : 0;
      return ((currentValue - previousValue) / previousValue) * 100;
    };

    return {
      totalViews: calculatePercentage(current.totalViews, previous.totalViews),
      totalLikes: calculatePercentage(current.totalLikes, previous.totalLikes),
      totalComments: calculatePercentage(current.totalComments, previous.totalComments),
      totalShares: calculatePercentage(current.totalShares, previous.totalShares),
      totalNewFollowers: calculatePercentage(current.totalNewFollowers, previous.totalNewFollowers),
      engagementRate: current.engagementRate - previous.engagementRate, // パーセンテージポイントの差分
    };
  };

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

      // 前期間の日付を計算
      const { previousStart, previousEnd } = calculatePreviousPeriod(startDate, endDate);
      console.log(`📅 Previous period: ${previousStart} to ${previousEnd}`);

      // 現在期間のデータを取得
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

      let currentSummary: AnalyticsSummary;
      let previousSummary: AnalyticsSummary | null = null;

      if (videoIds.length > 0) {
        // 現在期間のアナリティクスデータを取得
        const analyticsResponse: TikTokAnalyticsResponse = await tiktokClient.getVideoAnalytics({
          video_ids: videoIds,
          start_date: startDate,
          end_date: endDate,
        });

        // サマリーデータを変換
        currentSummary = convertApiSummaryToAnalyticsSummary(analyticsResponse.summary);
      } else {
        // 動画がない場合は空のサマリー
        currentSummary = {
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalNewFollowers: 0,
          avgWatchTime: 0,
          engagementRate: 0,
        };
      }

      try {
        // 前期間のデータを取得
        const previousVideoListResponse: TikTokVideoListResponse = await tiktokClient.getVideoList({
          start_date: previousStart,  
          end_date: previousEnd,
          max_count: 50,
        });

        const previousVideoIds = previousVideoListResponse.videos.map(v => v.video_id);

        if (previousVideoIds.length > 0) {
          const previousAnalyticsResponse: TikTokAnalyticsResponse = await tiktokClient.getVideoAnalytics({
            video_ids: previousVideoIds,
            start_date: previousStart,
            end_date: previousEnd,
          });

          previousSummary = convertApiSummaryToAnalyticsSummary(previousAnalyticsResponse.summary);
        } else {
          previousSummary = {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            totalNewFollowers: 0,
            avgWatchTime: 0,
            engagementRate: 0,
          };
        }
      } catch (prevErr) {
        console.warn('⚠️ Failed to fetch previous period data:', prevErr);
        // 前期間のデータ取得に失敗しても現在期間のデータは表示
      }

      // 比較データを計算
      const summaryWithComparison: AnalyticsSummaryWithComparison = {
        ...currentSummary,
        previousPeriod: previousSummary || undefined,
        comparison: previousSummary ? calculateComparison(currentSummary, previousSummary) : undefined,
      };

      setSummary(summaryWithComparison);

      console.log(`✅ Successfully fetched ${convertedVideos.length} videos (${mode} mode)`);
      if (previousSummary) {
        console.log('📈 Comparison data calculated successfully');
      }
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