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
  Button,
  ButtonGroup,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { mockVideos, calculateSummary } from '../data/mockData';
import { Bar } from 'react-chartjs-2';
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
  CalendarToday,
  DateRange,
  Assessment,
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
  const [selectedPreset, setSelectedPreset] = React.useState<string>('custom');
  const [showReport, setShowReport] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

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

  const getChangeDescription = (change: number) => {
    const absChange = Math.abs(change);
    
    if (absChange < 0.1) {
      return 'ほぼ変化なし';
    }
    
    const isPositive = change > 0;
    
    // 増減幅に応じた表現のプリセット
    if (isPositive) {
      if (absChange >= 50) return '大幅に伸びています';
      if (absChange >= 25) return '著しく向上しています';
      if (absChange >= 15) return '順調に成長しています';
      if (absChange >= 10) return '向上しています';
      if (absChange >= 5) return '緩やかに上昇しています';
      return '微増です';
    } else {
      if (absChange >= 50) return '大幅に減少しています';
      if (absChange >= 25) return '著しく低下しています';
      if (absChange >= 15) return '減少傾向にあります';
      if (absChange >= 10) return '低下しています';
      if (absChange >= 5) return '緩やかに減少しています';
      return '微減です';
    }
  };

  const handlePresetClick = (preset: string) => {
    setSelectedPreset(preset);
    const now = dayjs();
    
    switch (preset) {
      case 'weekly':
        // 直近1週間 vs その前の1週間
        setPeriod1Start(now.subtract(14, 'day'));
        setPeriod1End(now.subtract(7, 'day'));
        setPeriod2Start(now.subtract(7, 'day'));
        setPeriod2End(now);
        break;
      case 'monthly':
        // 直近1ヶ月 vs その前の1ヶ月
        setPeriod1Start(now.subtract(2, 'month'));
        setPeriod1End(now.subtract(1, 'month'));
        setPeriod2Start(now.subtract(1, 'month'));
        setPeriod2End(now);
        break;
      case 'custom':
      default:
        // カスタム設定はそのまま
        break;
    }
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
                {getChangeDescription(change)}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const formatPeriodLabel = (isFirstPeriod: boolean) => {
    if (selectedPreset === 'weekly') {
      return isFirstPeriod ? '先週' : '今週';
    } else if (selectedPreset === 'monthly') {
      return isFirstPeriod ? '先月' : '今月';
    } else {
      return isFirstPeriod ? '期間1' : '期間2';
    }
  };

  const handleGenerateReport = () => {
    setIsLoading(true);
    setShowReport(false);
    
    // 2秒間のローディング時間を設定
    setTimeout(() => {
      setIsLoading(false);
      setShowReport(true);
    }, 2000);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            AIレポート - 期間比較分析
          </Typography>
          

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>期間選択</Typography>
            
            {/* プリセットボタン */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                クイック選択
              </Typography>
              <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
                <Button
                  onClick={() => handlePresetClick('weekly')}
                  variant={selectedPreset === 'weekly' ? 'contained' : 'outlined'}
                  startIcon={<CalendarToday />}
                  sx={{
                    backgroundColor: selectedPreset === 'weekly' ? '#FE2C55' : 'transparent',
                    color: selectedPreset === 'weekly' ? 'white' : '#FE2C55',
                    borderColor: '#FE2C55',
                    '&:hover': {
                      backgroundColor: selectedPreset === 'weekly' ? '#E01E45' : 'rgba(254, 44, 85, 0.04)',
                      borderColor: '#FE2C55',
                    },
                  }}
                >
                  週次レポート
                </Button>
                <Button
                  onClick={() => handlePresetClick('monthly')}
                  variant={selectedPreset === 'monthly' ? 'contained' : 'outlined'}
                  startIcon={<DateRange />}
                  sx={{
                    backgroundColor: selectedPreset === 'monthly' ? '#FE2C55' : 'transparent',
                    color: selectedPreset === 'monthly' ? 'white' : '#FE2C55',
                    borderColor: '#FE2C55',
                    '&:hover': {
                      backgroundColor: selectedPreset === 'monthly' ? '#E01E45' : 'rgba(254, 44, 85, 0.04)',
                      borderColor: '#FE2C55',
                    },
                  }}
                >
                  月次レポート
                </Button>
                <Button
                  onClick={() => handlePresetClick('custom')}
                  variant={selectedPreset === 'custom' ? 'contained' : 'outlined'}
                  sx={{
                    backgroundColor: selectedPreset === 'custom' ? '#FE2C55' : 'transparent',
                    color: selectedPreset === 'custom' ? 'white' : '#FE2C55',
                    borderColor: '#FE2C55',
                    '&:hover': {
                      backgroundColor: selectedPreset === 'custom' ? '#E01E45' : 'rgba(254, 44, 85, 0.04)',
                      borderColor: '#FE2C55',
                    },
                  }}
                >
                  カスタム
                </Button>
              </ButtonGroup>
              
              {selectedPreset === 'weekly' && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  📅 直近1週間と前週を比較します
                </Alert>
              )}
              {selectedPreset === 'monthly' && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  📅 直近1ヶ月と前月を比較します
                </Alert>
              )}
            </Box>

            {/* カスタム期間選択 */}
            {selectedPreset === 'custom' && (
              <Stack spacing={3}>
                <Box>
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
                <Box>
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
              </Stack>
            )}
            
            {/* レポート出力ボタン */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleGenerateReport}
                disabled={!period1 || !period2 || isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Assessment />}
                sx={{
                  backgroundColor: '#FE2C55',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#E01E45',
                  },
                  '&:disabled': {
                    backgroundColor: 'grey.400',
                  },
                }}
              >
                {isLoading ? 'レポート生成中...' : 'レポートを出力'}
              </Button>
            </Box>
          </Paper>

          {/* ローディングアニメーション */}
          {isLoading && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              py: 8,
              gap: 3
            }}>
              <CircularProgress 
                size={80} 
                thickness={4}
                sx={{ 
                  color: '#FE2C55',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Typography variant="h6" color="textSecondary">
                AIがレポートを生成しています...
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
                選択された期間のデータを分析し、詳細なレポートを作成しています。
              </Typography>
            </Box>
          )}

          {period1 && period2 && showReport && !isLoading ? (
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
                
                {period1 && period2 && (
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    gap: 3 
                  }}>
                    {/* 再生回数 */}
                    <Paper sx={{ p: 2, bgcolor: 'white' }}>
                      <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                        📺 再生回数
                      </Typography>
                      <Box sx={{ height: 200 }}>
                        <Bar
                          data={{
                            labels: [formatPeriodLabel(true), formatPeriodLabel(false)],
                            datasets: [{
                              data: [period1.summary.totalViews, period2.summary.totalViews],
                              backgroundColor: ['rgba(254, 44, 85, 0.8)', 'rgba(37, 244, 238, 0.8)'],
                              borderColor: ['rgba(254, 44, 85, 1)', 'rgba(37, 244, 238, 1)'],
                              borderWidth: 1,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              y: { display: false, beginAtZero: true },
                              x: { grid: { display: false } }
                            },
                            plugins: { legend: { display: false } },
                            animation: {
                              duration: 1000,
                              onComplete: function(context: any) {
                                const chart = context.chart;
                                const ctx = chart.ctx;
                                ctx.save();
                                ctx.globalCompositeOperation = 'source-over';
                                ctx.font = 'bold 12px Arial';
                                ctx.fillStyle = 'black';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                
                                chart.data.datasets[0].data.forEach((value: number, index: number) => {
                                  const meta = chart.getDatasetMeta(0);
                                  const bar = meta.data[index] as any;
                                  if (bar && bar.x !== undefined && bar.y !== undefined && bar.base !== undefined) {
                                    const formattedValue = new Intl.NumberFormat('ja-JP').format(value);
                                    const yPos = bar.y + (bar.base - bar.y) / 2;
                                    ctx.fillText(formattedValue, bar.x, yPos);
                                  }
                                });
                                
                                ctx.restore();
                              }
                            }
                          }}
                        />
                      </Box>
                    </Paper>

                    {/* いいね数 */}
                    <Paper sx={{ p: 2, bgcolor: 'white' }}>
                      <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                        ❤️ いいね数
                      </Typography>
                      <Box sx={{ height: 200 }}>
                        <Bar
                          data={{
                            labels: [formatPeriodLabel(true), formatPeriodLabel(false)],
                            datasets: [{
                              data: [period1.summary.totalLikes, period2.summary.totalLikes],
                              backgroundColor: ['rgba(254, 44, 85, 0.8)', 'rgba(37, 244, 238, 0.8)'],
                              borderColor: ['rgba(254, 44, 85, 1)', 'rgba(37, 244, 238, 1)'],
                              borderWidth: 1,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              y: { display: false, beginAtZero: true },
                              x: { grid: { display: false } }
                            },
                            plugins: { legend: { display: false } },
                            animation: {
                              duration: 1000,
                              onComplete: function(context: any) {
                                const chart = context.chart;
                                const ctx = chart.ctx;
                                ctx.save();
                                ctx.globalCompositeOperation = 'source-over';
                                ctx.font = 'bold 12px Arial';
                                ctx.fillStyle = 'black';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                
                                chart.data.datasets[0].data.forEach((value: number, index: number) => {
                                  const meta = chart.getDatasetMeta(0);
                                  const bar = meta.data[index] as any;
                                  if (bar && bar.x !== undefined && bar.y !== undefined && bar.base !== undefined) {
                                    const formattedValue = new Intl.NumberFormat('ja-JP').format(value);
                                    const yPos = bar.y + (bar.base - bar.y) / 2;
                                    ctx.fillText(formattedValue, bar.x, yPos);
                                  }
                                });
                                
                                ctx.restore();
                              }
                            }
                          }}
                        />
                      </Box>
                    </Paper>

                    {/* コメント数 */}
                    <Paper sx={{ p: 2, bgcolor: 'white' }}>
                      <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                        💬 コメント数
                      </Typography>
                      <Box sx={{ height: 200 }}>
                        <Bar
                          data={{
                            labels: [formatPeriodLabel(true), formatPeriodLabel(false)],
                            datasets: [{
                              data: [period1.summary.totalComments, period2.summary.totalComments],
                              backgroundColor: ['rgba(254, 44, 85, 0.8)', 'rgba(37, 244, 238, 0.8)'],
                              borderColor: ['rgba(254, 44, 85, 1)', 'rgba(37, 244, 238, 1)'],
                              borderWidth: 1,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              y: { display: false, beginAtZero: true },
                              x: { grid: { display: false } }
                            },
                            plugins: { legend: { display: false } },
                            animation: {
                              duration: 1000,
                              onComplete: function(context: any) {
                                const chart = context.chart;
                                const ctx = chart.ctx;
                                ctx.save();
                                ctx.globalCompositeOperation = 'source-over';
                                ctx.font = 'bold 12px Arial';
                                ctx.fillStyle = 'black';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                
                                chart.data.datasets[0].data.forEach((value: number, index: number) => {
                                  const meta = chart.getDatasetMeta(0);
                                  const bar = meta.data[index] as any;
                                  if (bar && bar.x !== undefined && bar.y !== undefined && bar.base !== undefined) {
                                    const formattedValue = new Intl.NumberFormat('ja-JP').format(value);
                                    const yPos = bar.y + (bar.base - bar.y) / 2;
                                    ctx.fillText(formattedValue, bar.x, yPos);
                                  }
                                });
                                
                                ctx.restore();
                              }
                            }
                          }}
                        />
                      </Box>
                    </Paper>

                    {/* シェア数 */}
                    <Paper sx={{ p: 2, bgcolor: 'white' }}>
                      <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                        🔄 シェア数
                      </Typography>
                      <Box sx={{ height: 200 }}>
                        <Bar
                          data={{
                            labels: [formatPeriodLabel(true), formatPeriodLabel(false)],
                            datasets: [{
                              data: [period1.summary.totalShares, period2.summary.totalShares],
                              backgroundColor: ['rgba(254, 44, 85, 0.8)', 'rgba(37, 244, 238, 0.8)'],
                              borderColor: ['rgba(254, 44, 85, 1)', 'rgba(37, 244, 238, 1)'],
                              borderWidth: 1,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              y: { display: false, beginAtZero: true },
                              x: { grid: { display: false } }
                            },
                            plugins: { legend: { display: false } },
                            animation: {
                              duration: 1000,
                              onComplete: function(context: any) {
                                const chart = context.chart;
                                const ctx = chart.ctx;
                                ctx.save();
                                ctx.globalCompositeOperation = 'source-over';
                                ctx.font = 'bold 12px Arial';
                                ctx.fillStyle = 'black';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                
                                chart.data.datasets[0].data.forEach((value: number, index: number) => {
                                  const meta = chart.getDatasetMeta(0);
                                  const bar = meta.data[index] as any;
                                  if (bar && bar.x !== undefined && bar.y !== undefined && bar.base !== undefined) {
                                    const formattedValue = new Intl.NumberFormat('ja-JP').format(value);
                                    const yPos = bar.y + (bar.base - bar.y) / 2;
                                    ctx.fillText(formattedValue, bar.x, yPos);
                                  }
                                });
                                
                                ctx.restore();
                              }
                            }
                          }}
                        />
                      </Box>
                    </Paper>

                    {/* 新規フォロワー */}
                    <Paper sx={{ p: 2, bgcolor: 'white' }}>
                      <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                        👥 新規フォロワー
                      </Typography>
                      <Box sx={{ height: 200 }}>
                        <Bar
                          data={{
                            labels: [formatPeriodLabel(true), formatPeriodLabel(false)],
                            datasets: [{
                              data: [period1.summary.totalNewFollowers, period2.summary.totalNewFollowers],
                              backgroundColor: ['rgba(254, 44, 85, 0.8)', 'rgba(37, 244, 238, 0.8)'],
                              borderColor: ['rgba(254, 44, 85, 1)', 'rgba(37, 244, 238, 1)'],
                              borderWidth: 1,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              y: { display: false, beginAtZero: true },
                              x: { grid: { display: false } }
                            },
                            plugins: { legend: { display: false } },
                            animation: {
                              duration: 1000,
                              onComplete: function(context: any) {
                                const chart = context.chart;
                                const ctx = chart.ctx;
                                ctx.save();
                                ctx.globalCompositeOperation = 'source-over';
                                ctx.font = 'bold 12px Arial';
                                ctx.fillStyle = 'black';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                
                                chart.data.datasets[0].data.forEach((value: number, index: number) => {
                                  const meta = chart.getDatasetMeta(0);
                                  const bar = meta.data[index] as any;
                                  if (bar && bar.x !== undefined && bar.y !== undefined && bar.base !== undefined) {
                                    const formattedValue = new Intl.NumberFormat('ja-JP').format(value);
                                    const yPos = bar.y + (bar.base - bar.y) / 2;
                                    ctx.fillText(formattedValue, bar.x, yPos);
                                  }
                                });
                                
                                ctx.restore();
                              }
                            }
                          }}
                        />
                      </Box>
                    </Paper>

                    {/* 平均閲覧時間 */}
                    <Paper sx={{ p: 2, bgcolor: 'white' }}>
                      <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                        ⏱️ 平均閲覧時間
                      </Typography>
                      <Box sx={{ height: 200 }}>
                        <Bar
                          data={{
                            labels: [formatPeriodLabel(true), formatPeriodLabel(false)],
                            datasets: [{
                              data: [period1.summary.avgWatchTime, period2.summary.avgWatchTime],
                              backgroundColor: ['rgba(254, 44, 85, 0.8)', 'rgba(37, 244, 238, 0.8)'],
                              borderColor: ['rgba(254, 44, 85, 1)', 'rgba(37, 244, 238, 1)'],
                              borderWidth: 1,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              y: { display: false, beginAtZero: true },
                              x: { grid: { display: false } }
                            },
                            animation: {
                              duration: 1000,
                              onComplete: function(context) {
                                const chart = context.chart;
                                const ctx = chart.ctx;
                                ctx.font = 'bold 11px Arial';
                                ctx.fillStyle = '#333';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                chart.data.datasets[0].data.forEach((value, index) => {
                                  const meta = chart.getDatasetMeta(0);
                                  const bar = meta.data[index];
                                  const formattedValue = `${(value as number).toFixed(1)}秒`;
                                  ctx.fillText(formattedValue, bar.x, bar.y - 5);
                                });
                              }
                            }
                          }}
                        />
                      </Box>
                    </Paper>
                  </Box>
                )}
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
            !isLoading && !showReport && period1 && period2 && (
              <Alert severity="info">
                期間を選択後、「レポートを出力」ボタンをクリックしてください。
              </Alert>
            )
          )}
          
          {!period1 || !period2 ? (
            <Alert severity="warning">
              比較する2つの期間を選択してください。
            </Alert>
          ) : null}
        </Box>
      </Container>
    </LocalizationProvider>
  );
};