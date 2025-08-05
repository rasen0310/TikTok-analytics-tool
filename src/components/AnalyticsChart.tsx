import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { TikTokVideo } from '../types';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsChartProps {
  videos: TikTokVideo[];
  dateRange?: { startDate: string; endDate: string };
}

type ChartType = 'views' | 'likes' | 'comments' | 'shares' | 'followers' | 'watchTime' | 'duration';

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ videos, dateRange }) => {
  const [selectedMetrics, setSelectedMetrics] = React.useState<ChartType[]>(['views']);

  const handleMetricToggle = (metric: ChartType) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metric)) {
        // 既に選択されている場合は削除
        return prev.filter(m => m !== metric);
      } else {
        // 選択されていない場合は追加
        return [...prev, metric];
      }
    });
  };

  // 期間内の全ての日付を生成し、データがない日は0で表示
  const generateLabelsAndData = () => {
    if (!dateRange) {
      // dateRangeが提供されない場合は従来の方法を使用
      return {
        labels: videos.map(video => video.postDate),
        videosByDate: videos.reduce((acc, video) => {
          acc[video.postDate] = video;
          return acc;
        }, {} as Record<string, TikTokVideo>)
      };
    }

    const { startDate, endDate } = dateRange;
    const labels: string[] = [];
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    
    // 全ての日付を生成
    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      labels.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    // 日付ごとにビデオデータをマッピング
    const videosByDate = videos.reduce((acc, video) => {
      acc[video.postDate] = video;
      return acc;
    }, {} as Record<string, TikTokVideo>);

    return { labels, videosByDate };
  };

  const { labels, videosByDate } = generateLabelsAndData();

  // 各メトリクスの設定
  const metricConfigs = {
    views: {
      label: '再生回数',
      field: 'views' as keyof TikTokVideo,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    },
    likes: {
      label: 'いいね数',
      field: 'likes' as keyof TikTokVideo,
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
    },
    comments: {
      label: 'コメント数',
      field: 'comments' as keyof TikTokVideo,
      borderColor: 'rgb(255, 206, 86)',
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
    },
    shares: {
      label: 'シェア数',
      field: 'shares' as keyof TikTokVideo,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    },
    followers: {
      label: '新規フォロワー',
      field: 'newFollowers' as keyof TikTokVideo,
      borderColor: 'rgb(153, 102, 255)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
    },
    watchTime: {
      label: '平均閲覧時間（秒）',
      field: 'avgWatchTime' as keyof TikTokVideo,
      borderColor: 'rgb(255, 159, 64)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
    },
    duration: {
      label: '動画尺（秒）',
      field: 'duration' as keyof TikTokVideo,
      borderColor: 'rgb(199, 199, 199)',
      backgroundColor: 'rgba(199, 199, 199, 0.2)',
    },
  };

  const getChartData = () => {
    // 各日付のデータを取得する関数
    const getDataForDate = (date: string, field: keyof TikTokVideo): number => {
      const video = videosByDate[date];
      return video ? (video[field] as number) : 0;
    };

    // 選択されたメトリクスに基づいてデータセットを生成
    const datasets = selectedMetrics.map(metric => {
      const config = metricConfigs[metric];
      return {
        label: config.label,
        data: labels.map(date => getDataForDate(date, config.field)),
        borderColor: config.borderColor,
        backgroundColor: config.backgroundColor,
        tension: 0.1,
      };
    });

    return {
      labels,
      datasets,
    };
  };

  const getChartTitle = () => {
    if (selectedMetrics.length === 0) {
      return 'データ推移（メトリクスを選択してください）';
    }
    if (selectedMetrics.length === 1) {
      const metric = selectedMetrics[0];
      return metricConfigs[metric].label + 'の推移';
    }
    return '複数メトリクスの推移';
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: getChartTitle(),
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        データ可視化
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1, 
        mb: 2,
        justifyContent: 'center'
      }}>
        {Object.entries(metricConfigs).map(([key, config]) => (
          <Button
            key={key}
            variant={selectedMetrics.includes(key as ChartType) ? 'contained' : 'outlined'}
            onClick={() => handleMetricToggle(key as ChartType)}
            sx={{
              fontSize: '0.875rem',
              padding: '6px 12px',
              borderColor: selectedMetrics.includes(key as ChartType) ? undefined : config.borderColor,
              color: selectedMetrics.includes(key as ChartType) ? 'white' : config.borderColor,
              backgroundColor: selectedMetrics.includes(key as ChartType) ? config.borderColor : 'transparent',
              '&:hover': {
                backgroundColor: selectedMetrics.includes(key as ChartType) 
                  ? config.borderColor 
                  : config.backgroundColor,
                borderColor: config.borderColor,
              },
            }}
          >
            {config.label}
          </Button>
        ))}
      </Box>

      <Box sx={{ 
        backgroundColor: 'white', 
        p: 2, 
        borderRadius: 1, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: '400px'
      }}>
        <Line data={getChartData()} options={options} />
      </Box>
    </Box>
  );
};