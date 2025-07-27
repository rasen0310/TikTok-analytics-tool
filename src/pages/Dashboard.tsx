import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { DateRangeSelector } from '../components/DateRangeSelector';
import { SummaryCards } from '../components/SummaryCards';
import { VideoTable } from '../components/VideoTable';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { mockVideos, calculateSummary } from '../data/mockData';
import type { TikTokVideo, AnalyticsSummary } from '../types';

export const Dashboard: React.FC = () => {
  const [videos, setVideos] = React.useState<TikTokVideo[]>([]);
  const [summary, setSummary] = React.useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setLoading(true);
    
    // モックデータを使用（実際のAPIコールのシミュレーション）
    setTimeout(() => {
      const filteredVideos = mockVideos.filter(video => {
        return video.postDate >= startDate && video.postDate <= endDate;
      });
      
      setVideos(filteredVideos);
      // フィルタリングされたデータに基づいてサマリーを計算
      setSummary(calculateSummary(filteredVideos));
      setLoading(false);
    }, 500);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h6" color="textSecondary">
            TikTok動画のパフォーマンスを分析・可視化
          </Typography>
        </Box>
        
        <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography variant="h6">データを読み込み中...</Typography>
          </Box>
        ) : (
          <>
            {summary && <SummaryCards summary={summary} />}
            {videos.length > 0 && (
              <>
                <AnalyticsChart videos={videos} />
                <VideoTable videos={videos} />
              </>
            )}
            {!loading && videos.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                選択された期間にデータがありません。日付範囲を調整してください。
              </Alert>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};