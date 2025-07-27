import type { TikTokVideo, AnalyticsSummary } from '../types';

export const mockVideos: TikTokVideo[] = [
  {
    id: '1',
    videoUrl: 'https://www.tiktok.com/@user/video/123456789',
    postDate: '2024-01-15',
    postTime: '14:30',
    duration: 30,
    views: 125000,
    likes: 8500,
    comments: 340,
    shares: 1200,
    newFollowers: 450,
    avgWatchTime: 22.5
  },
  {
    id: '2',
    videoUrl: 'https://www.tiktok.com/@user/video/123456790',
    postDate: '2024-01-16',
    postTime: '18:45',
    duration: 45,
    views: 89000,
    likes: 6200,
    comments: 280,
    shares: 890,
    newFollowers: 320,
    avgWatchTime: 31.2
  },
  {
    id: '3',
    videoUrl: 'https://www.tiktok.com/@user/video/123456791',
    postDate: '2024-01-17',
    postTime: '12:15',
    duration: 25,
    views: 156000,
    likes: 12000,
    comments: 520,
    shares: 1800,
    newFollowers: 680,
    avgWatchTime: 19.8
  },
  {
    id: '4',
    videoUrl: 'https://www.tiktok.com/@user/video/123456792',
    postDate: '2024-01-18',
    postTime: '20:30',
    duration: 60,
    views: 203000,
    likes: 15600,
    comments: 720,
    shares: 2300,
    newFollowers: 890,
    avgWatchTime: 42.1
  },
  {
    id: '5',
    videoUrl: 'https://www.tiktok.com/@user/video/123456793',
    postDate: '2024-01-19',
    postTime: '16:00',
    duration: 35,
    views: 98000,
    likes: 7800,
    comments: 310,
    shares: 1100,
    newFollowers: 420,
    avgWatchTime: 26.7
  }
];

export const mockSummary: AnalyticsSummary = {
  totalViews: 671000,
  totalLikes: 50100,
  totalComments: 2170,
  totalShares: 7290,
  totalNewFollowers: 2760,
  avgWatchTime: 28.46,
  engagementRate: 8.47
};