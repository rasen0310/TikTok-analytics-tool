import type { TikTokVideo, AnalyticsSummary } from '../types';

// 過去30日間のデータを動的に生成
const generateMockVideos = (): TikTokVideo[] => {
  const videos: TikTokVideo[] = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // ランダムな値を生成（リアルなデータ風に）
    const views = Math.floor(Math.random() * 200000) + 50000;
    const likes = Math.floor(views * (Math.random() * 0.1 + 0.05));
    const comments = Math.floor(likes * (Math.random() * 0.05 + 0.02));
    const shares = Math.floor(likes * (Math.random() * 0.15 + 0.05));
    const newFollowers = Math.floor(views * (Math.random() * 0.005 + 0.001));
    const avgWatchTime = Math.floor(Math.random() * 30) + 10;
    const duration = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
    
    videos.push({
      id: `video-${i + 1}`,
      videoUrl: `https://www.tiktok.com/@user/video/${Date.now() - i * 86400000}`,
      postDate: date.toISOString().split('T')[0],
      postTime: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      duration,
      views,
      likes,
      comments,
      shares,
      newFollowers,
      avgWatchTime
    });
  }
  
  return videos.reverse(); // 古い日付から新しい日付の順に並び替え
};

export const mockVideos: TikTokVideo[] = generateMockVideos();

// サマリーデータを動的に計算
export const calculateSummary = (videos: TikTokVideo[]): AnalyticsSummary => {
  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
  const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0);
  const totalComments = videos.reduce((sum, video) => sum + video.comments, 0);
  const totalShares = videos.reduce((sum, video) => sum + video.shares, 0);
  const totalNewFollowers = videos.reduce((sum, video) => sum + video.newFollowers, 0);
  const avgWatchTime = videos.reduce((sum, video) => sum + video.avgWatchTime, 0) / videos.length;
  
  // エンゲージメント率 = (いいね + コメント + シェア) / 再生回数 * 100
  const engagementRate = totalViews > 0 
    ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 
    : 0;
  
  return {
    totalViews,
    totalLikes,
    totalComments,
    totalShares,
    totalNewFollowers,
    avgWatchTime: Math.round(avgWatchTime * 100) / 100,
    engagementRate: Math.round(engagementRate * 100) / 100
  };
};

export const mockSummary: AnalyticsSummary = calculateSummary(mockVideos);