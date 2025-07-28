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
  Divider,
  Avatar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { mockVideos, calculateSummary } from '../data/mockData';
import { Line } from 'react-chartjs-2';
import {
  Remove as NoChangeIcon,
  ArrowUpward,
  ArrowDownward,
  PlayArrow,
  Favorite,
  Comment,
  Share,
  PersonAdd,
  AccessTime,
} from '@mui/icons-material';

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

  const getMetricIcon = (metric: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      '総再生回数': <PlayArrow />,
      '総いいね数': <Favorite />,
      '総コメント数': <Comment />,
      '総シェア数': <Share />,
      '新規フォロワー': <PersonAdd />,
      '平均閲覧時間': <AccessTime />,
    };
    return iconMap[metric] || <PlayArrow />;
  };

  const renderComparison = (metric: string, value1: number, value2: number, format?: (n: number) => string) => {
    const change = calculateChange(value1, value2);
    const isPositive = change > 0;
    const isNoChange = Math.abs(change) < 0.1;
    const formatValue = format || ((n: number) => new Intl.NumberFormat('ja-JP').format(n));
    
    const getChangeColor = () => {
      if (isNoChange) return 'default';
      return isPositive ? 'success' : 'error';
    };
    
    const getChangeIcon = () => {
      if (isNoChange) return <NoChangeIcon />;
      return isPositive ? <ArrowUpward /> : <ArrowDownward />;
    };

    return (
      <Card 
        sx={{ 
          height: '100%',
          position: 'relative',
          border: '1px solid',
          borderColor: isNoChange ? 'grey.300' : (isPositive ? 'success.light' : 'error.light'),
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: isNoChange ? 'grey.100' : (isPositive ? 'success.50' : 'error.50'),
                color: isNoChange ? 'grey.600' : (isPositive ? 'success.main' : 'error.main'),
                mr: 2,
                width: 40,
                height: 40,
              }}
            >
              {getMetricIcon(metric)}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {metric}
            </Typography>
          </Box>
          
          <Stack spacing={2}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                期間1 (過去)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {formatValue(value1)}
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              bgcolor: isNoChange ? 'grey.50' : (isPositive ? 'success.50' : 'error.50'),
              borderRadius: 1,
              border: '2px solid',
              borderColor: isNoChange ? 'grey.200' : (isPositive ? 'success.main' : 'error.main'),
            }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                期間2 (最新)
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: isNoChange ? 'text.primary' : (isPositive ? 'success.dark' : 'error.dark')
                }}
              >
                {formatValue(value2)}
              </Typography>
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Chip
                icon={getChangeIcon()}
                label={
                  isNoChange 
                    ? '変化なし' 
                    : `${isPositive ? '+' : ''}${change.toFixed(1)}%`
                }
                color={getChangeColor()}
                variant="filled"
                size="medium"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  height: 36,
                  '& .MuiChip-icon': {
                    fontSize: '1.2rem',
                  },
                }}
              />
            </Box>
            
            {!isNoChange && (
              <Typography 
                variant="body2" 
                align="center"
                sx={{ 
                  color: isPositive ? 'success.dark' : 'error.dark',
                  fontWeight: 500,
                  mt: 1
                }}
              >
                {isPositive ? '向上しています' : '減少しています'}
              </Typography>
            )}
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
              <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  📊 パフォーマンス比較分析
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'center', opacity: 0.9 }}>
                  2つの期間を詳細に比較して、成長トレンドを把握しましょう
                </Typography>
              </Paper>

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

              <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    📊
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    期間比較チャート
                  </Typography>
                </Box>
                <Paper sx={{ p: 2, bgcolor: 'white' }}>
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
                              labels: {
                                usePointStyle: true,
                                padding: 20,
                                font: {
                                  size: 14,
                                  weight: 'bold',
                                },
                              },
                            },
                            title: {
                              display: true,
                              text: '📈 主要指標の期間比較分析',
                              font: {
                                size: 16,
                                weight: 'bold',
                              },
                              padding: 20,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0,0,0,0.1)',
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                },
                              },
                            },
                            x: {
                              grid: {
                                color: 'rgba(0,0,0,0.1)',
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                  weight: 'bold',
                                },
                              },
                            },
                          },
                          elements: {
                            line: {
                              tension: 0.4,
                              borderWidth: 3,
                            },
                            point: {
                              radius: 6,
                              hoverRadius: 8,
                            },
                          },
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Paper>

              <Paper sx={{ 
                p: 4, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  width: 100, 
                  height: 100, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255,255,255,0.1)' 
                }} />
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: -30, 
                  left: -30, 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255,255,255,0.1)' 
                }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
                    🤖
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      AI分析レポート
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      データに基づく詳細な分析結果と改善提案
                    </Typography>
                  </Box>
                </Box>
                
                <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                  <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)', color: 'text.primary', borderRadius: 2 }}>
                    {calculateChange(period1.summary.totalViews, period2.summary.totalViews) > 0 ? (
                      <Alert 
                        severity="success" 
                        sx={{ 
                          fontSize: '1rem',
                          '& .MuiAlert-icon': { fontSize: '1.5rem' },
                          bgcolor: 'success.50',
                          border: '1px solid',
                          borderColor: 'success.main',
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          📈 再生回数が大幅向上！
                        </Typography>
                        期間2の再生回数は期間1と比較して
                        <Typography component="span" sx={{ fontWeight: 'bold', color: 'success.dark', fontSize: '1.1rem' }}>
                          {calculateChange(period1.summary.totalViews, period2.summary.totalViews).toFixed(1)}%
                        </Typography>
                        増加しています。コンテンツのパフォーマンスが向上しています。
                      </Alert>
                    ) : (
                      <Alert 
                        severity="warning"
                        sx={{ 
                          fontSize: '1rem',
                          '& .MuiAlert-icon': { fontSize: '1.5rem' },
                          bgcolor: 'warning.50',
                          border: '1px solid',
                          borderColor: 'warning.main',
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          📉 再生回数の減少を確認
                        </Typography>
                        期間2の再生回数は期間1と比較して
                        <Typography component="span" sx={{ fontWeight: 'bold', color: 'warning.dark', fontSize: '1.1rem' }}>
                          {Math.abs(calculateChange(period1.summary.totalViews, period2.summary.totalViews)).toFixed(1)}%
                        </Typography>
                        減少しています。コンテンツ戦略の見直しを検討してください。
                      </Alert>
                    )}
                  </Paper>

                  <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)', color: 'text.primary', borderRadius: 2 }}>
                    {calculateChange(period1.summary.engagementRate, period2.summary.engagementRate) > 0 ? (
                      <Alert 
                        severity="success"
                        sx={{ 
                          fontSize: '1rem',
                          '& .MuiAlert-icon': { fontSize: '1.5rem' },
                          bgcolor: 'success.50',
                          border: '1px solid',
                          borderColor: 'success.main',
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          💪 エンゲージメントが向上
                        </Typography>
                        エンゲージメント率が
                        <Typography component="span" sx={{ fontWeight: 'bold', color: 'success.dark', fontSize: '1.1rem' }}>
                          {calculateChange(period1.summary.engagementRate, period2.summary.engagementRate).toFixed(1)}%
                        </Typography>
                        向上しています。視聴者との関係性が強化されています。
                      </Alert>
                    ) : (
                      <Alert 
                        severity="info"
                        sx={{ 
                          fontSize: '1rem',
                          '& .MuiAlert-icon': { fontSize: '1.5rem' },
                          bgcolor: 'info.50',
                          border: '1px solid',
                          borderColor: 'info.main',
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          🤔 エンゲージメントに注目
                        </Typography>
                        エンゲージメント率に変化が見られます。
                        コンテンツの質を維持しながら、視聴者との交流を増やす工夫が必要かもしれません。
                      </Alert>
                    )}
                  </Paper>

                  <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)', color: 'text.primary', borderRadius: 2 }}>
                    <Alert 
                      severity="info"
                      sx={{ 
                        fontSize: '1rem',
                        '& .MuiAlert-icon': { fontSize: '1.5rem' },
                        bgcolor: 'info.50',
                        border: '1px solid',
                        borderColor: 'info.main',
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        📊 投稿頻度の分析
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Chip 
                          label={`期間1: ${period1.videos.length}本`} 
                          color="primary" 
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                        <Chip 
                          label={`期間2: ${period2.videos.length}本`} 
                          color="secondary" 
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      {period1.videos.length !== period2.videos.length && (
                        <Typography sx={{ mt: 1, fontWeight: 500 }}>
                          💡 投稿頻度の変化がパフォーマンスに影響している可能性があります。
                        </Typography>
                      )}
                    </Alert>
                  </Paper>
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