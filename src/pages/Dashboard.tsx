import React from 'react';
import { Container, Typography, Box, Alert, Chip } from '@mui/material';
import { DateRangeSelector } from '../components/DateRangeSelector';
import { SummaryCards } from '../components/SummaryCards';
import { VideoTable } from '../components/VideoTable';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { useTikTokData } from '../hooks/useTikTokData';

export const Dashboard: React.FC = () => {
  const { 
    videos, 
    summary, 
    loading, 
    error, 
    fetchData, 
    mode, 
    isConfigured
  } = useTikTokData();

  const [currentDateRange, setCurrentDateRange] = React.useState<{ startDate: string; endDate: string } | null>(null);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setCurrentDateRange({ startDate, endDate });
    fetchData(startDate, endDate);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h6" color="textSecondary">
            TikTok動画のパフォーマンスを分析・可視化
          </Typography>
          
          {/* API モード表示 */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Chip 
              label={mode === 'development' ? 'モックデータ' : '本番API'} 
              color={mode === 'development' ? 'secondary' : 'primary'}
              variant="outlined"
              size="small"
            />
            <Chip 
              label={isConfigured ? '設定済み' : '未設定'} 
              color={isConfigured ? 'success' : 'warning'}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>
        
        <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
            {mode === 'production' && !isConfigured && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  TikTok APIキーが設定されていないため、モックデータを使用しています。
                </Typography>
              </Box>
            )}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography variant="h6">
              データを読み込み中... ({mode === 'development' ? 'モック' : '本番API'})
            </Typography>
          </Box>
        ) : (
          <>
            {summary && <SummaryCards summary={summary} />}
            {currentDateRange && (
              <AnalyticsChart videos={videos} dateRange={currentDateRange} />
            )}
            <VideoTable 
              videos={videos} 
              loading={loading}
              onRefresh={() => currentDateRange && fetchData(currentDateRange.startDate, currentDateRange.endDate)}
            />
            {!loading && videos.length === 0 && !error && (
              <Alert severity="info" sx={{ mt: 2 }}>
                選択された期間にデータがありません。日付範囲を調整してください。
                {mode === 'development' && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      現在モックデータを使用しています。実際のTikTok APIを使用するにはAPIキーが必要です。
                    </Typography>
                  </Box>
                )}
              </Alert>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};