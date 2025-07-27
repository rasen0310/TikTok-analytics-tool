import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { mockVideos, calculateSummary } from '../data/mockData';
import { Line } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface PeriodData {
  label: string;
  startDate: string;
  endDate: string;
  summary: any;
  videos: any[];
}

export const AIReport: React.FC = () => {
  const [period1Start, setPeriod1Start] = React.useState<Dayjs | null>(dayjs().subtract(14, 'day'));
  const [period1End, setPeriod1End] = React.useState<Dayjs | null>(dayjs().subtract(7, 'day'));
  const [period2Start, setPeriod2Start] = React.useState<Dayjs | null>(dayjs().subtract(7, 'day'));
  const [period2End, setPeriod2End] = React.useState<Dayjs | null>(dayjs());

  const getPeriodData = (startDate: Dayjs | null, endDate: Dayjs | null): PeriodData | null => {
    if (!startDate || !endDate) return null;

    const start = startDate.format('YYYY-MM-DD');
    const end = endDate.format('YYYY-MM-DD');
    
    const filteredVideos = mockVideos.filter(video => {
      return video.postDate >= start && video.postDate <= end;
    });

    return {
      label: `${start} ~ ${end}`,
      startDate: start,
      endDate: end,
      summary: calculateSummary(filteredVideos),
      videos: filteredVideos,
    };
  };

  const period1 = getPeriodData(period1Start, period1End);
  const period2 = getPeriodData(period2Start, period2End);

  const calculateChange = (oldValue: number, newValue: number) => {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  };

  const renderComparison = (metric: string, value1: number, value2: number, format?: (n: number) => string) => {
    const change = calculateChange(value1, value2);
    const isPositive = change >= 0;
    const formatValue = format || ((n: number) => new Intl.NumberFormat('ja-JP').format(n));

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {metric}
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="textSecondary">期間1</Typography>
              <Typography variant="h6">{formatValue(value1)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">期間2</Typography>
              <Typography variant="h6">{formatValue(value2)}</Typography>
            </Box>
            <Chip
              icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${isPositive ? '+' : ''}${change.toFixed(1)}%`}
              color={isPositive ? 'success' : 'error'}
              size="small"
            />
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const chartData = period1 && period2 ? {
    labels: ['再生回数', 'いいね数', 'コメント数', 'シェア数', '新規フォロワー'],
    datasets: [
      {
        label: '期間1',
        data: [
          period1.summary.totalViews,
          period1.summary.totalLikes,
          period1.summary.totalComments,
          period1.summary.totalShares,
          period1.summary.totalNewFollowers,
        ],
        backgroundColor: 'rgba(254, 44, 85, 0.6)',
      },
      {
        label: '期間2',
        data: [
          period2.summary.totalViews,
          period2.summary.totalLikes,
          period2.summary.totalComments,
          period2.summary.totalShares,
          period2.summary.totalNewFollowers,
        ],
        backgroundColor: 'rgba(37, 244, 238, 0.6)',
      },
    ],
  } : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            AIレポート - 期間比較分析
          </Typography>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>期間選択</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <Box sx={{ flex: '1 1 auto', minWidth: '300px' }}>
                <Typography variant="subtitle1" gutterBottom>期間1</Typography>
                <Stack direction="row" spacing={2}>
                  <DatePicker
                    label="開始日"
                    value={period1Start}
                    onChange={(newValue) => setPeriod1Start(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <DatePicker
                    label="終了日"
                    value={period1End}
                    onChange={(newValue) => setPeriod1End(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Stack>
              </Box>
              <Box sx={{ flex: '1 1 auto', minWidth: '300px' }}>
                <Typography variant="subtitle1" gutterBottom>期間2</Typography>
                <Stack direction="row" spacing={2}>
                  <DatePicker
                    label="開始日"
                    value={period2Start}
                    onChange={(newValue) => setPeriod2Start(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <DatePicker
                    label="終了日"
                    value={period2End}
                    onChange={(newValue) => setPeriod2End(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Stack>
              </Box>
            </Box>
          </Paper>

          {period1 && period2 ? (
            <>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                パフォーマンス比較
              </Typography>

              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 3, 
                mb: 4 
              }}>
                {renderComparison('総再生回数', period1.summary.totalViews, period2.summary.totalViews)}
                {renderComparison('総いいね数', period1.summary.totalLikes, period2.summary.totalLikes)}
                {renderComparison('総コメント数', period1.summary.totalComments, period2.summary.totalComments)}
                {renderComparison('総シェア数', period1.summary.totalShares, period2.summary.totalShares)}
                {renderComparison('新規フォロワー', period1.summary.totalNewFollowers, period2.summary.totalNewFollowers)}
                {renderComparison(
                  '平均閲覧時間',
                  period1.summary.avgWatchTime,
                  period2.summary.avgWatchTime,
                  (n) => `${n.toFixed(1)}秒`
                )}
              </Box>

              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>期間比較チャート</Typography>
                <Box sx={{ height: 400 }}>
                  {chartData && (
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                          title: {
                            display: true,
                            text: '主要指標の比較',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  )}
                </Box>
              </Paper>

              <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom>AI分析レポート</Typography>
                <Stack spacing={2}>
                  {calculateChange(period1.summary.totalViews, period2.summary.totalViews) > 0 ? (
                    <Alert severity="success">
                      期間2の再生回数は期間1と比較して
                      {calculateChange(period1.summary.totalViews, period2.summary.totalViews).toFixed(1)}%
                      増加しています。コンテンツのパフォーマンスが向上しています。
                    </Alert>
                  ) : (
                    <Alert severity="warning">
                      期間2の再生回数は期間1と比較して
                      {Math.abs(calculateChange(period1.summary.totalViews, period2.summary.totalViews)).toFixed(1)}%
                      減少しています。コンテンツ戦略の見直しを検討してください。
                    </Alert>
                  )}

                  {calculateChange(period1.summary.engagementRate, period2.summary.engagementRate) > 0 ? (
                    <Alert severity="success">
                      エンゲージメント率が
                      {calculateChange(period1.summary.engagementRate, period2.summary.engagementRate).toFixed(1)}%
                      向上しています。視聴者との関係性が強化されています。
                    </Alert>
                  ) : (
                    <Alert severity="info">
                      エンゲージメント率に変化が見られます。
                      コンテンツの質を維持しながら、視聴者との交流を増やす工夫が必要かもしれません。
                    </Alert>
                  )}

                  <Alert severity="info">
                    投稿数: 期間1では{period1.videos.length}本、期間2では{period2.videos.length}本の動画が投稿されました。
                    {period1.videos.length !== period2.videos.length && 
                      '投稿頻度の変化がパフォーマンスに影響している可能性があります。'}
                  </Alert>
                </Stack>
              </Paper>
            </>
          ) : (
            <Alert severity="info">
              比較する2つの期間を選択してください。
            </Alert>
          )}
        </Box>
      </Container>
    </LocalizationProvider>
  );
};