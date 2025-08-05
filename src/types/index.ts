export interface TikTokVideo {
  id: string;
  videoUrl: string;
  postDate: string;
  postTime: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  newFollowers: number;
  avgWatchTime: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalNewFollowers: number;
  avgWatchTime: number;
  engagementRate: number;
}

export interface ComparisonData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalNewFollowers: number;
  engagementRate: number;
}

export interface AnalyticsSummaryWithComparison extends AnalyticsSummary {
  previousPeriod?: AnalyticsSummary;
  comparison?: ComparisonData;
}

export type DateRangePreset = '7days' | '14days' | '21days' | 'custom';