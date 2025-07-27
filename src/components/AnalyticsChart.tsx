import React from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
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
import { Line, Bar } from 'react-chartjs-2';
import type { TikTokVideo } from '../types';

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
}

type ChartType = 'views' | 'likes' | 'comments' | 'shares' | 'followers' | 'watchTime' | 'duration' | 'engagement';

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ videos }) => {
  const [chartType, setChartType] = React.useState<ChartType>('views');

  const handleChartTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: ChartType | null
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const labels = videos.map(video => video.postDate);

  const getChartData = () => {
    switch (chartType) {
      case 'views':
        return {
          labels,
          datasets: [
            {
              label: '再生回数',
              data: videos.map(video => video.views),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.1,
            },
          ],
        };
      case 'likes':
        return {
          labels,
          datasets: [
            {
              label: 'いいね数',
              data: videos.map(video => video.likes),
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              tension: 0.1,
            },
          ],
        };
      case 'comments':
        return {
          labels,
          datasets: [
            {
              label: 'コメント数',
              data: videos.map(video => video.comments),
              borderColor: 'rgb(255, 206, 86)',
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              tension: 0.1,
            },
          ],
        };
      case 'shares':
        return {
          labels,
          datasets: [
            {
              label: 'シェア数',
              data: videos.map(video => video.shares),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
            },
          ],
        };
      case 'followers':
        return {
          labels,
          datasets: [
            {
              label: '新規フォロワー',
              data: videos.map(video => video.newFollowers),
              borderColor: 'rgb(153, 102, 255)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              tension: 0.1,
            },
          ],
        };
      case 'watchTime':
        return {
          labels,
          datasets: [
            {
              label: '平均閲覧時間（秒）',
              data: videos.map(video => video.avgWatchTime),
              borderColor: 'rgb(255, 159, 64)',
              backgroundColor: 'rgba(255, 159, 64, 0.2)',
              tension: 0.1,
            },
          ],
        };
      case 'duration':
        return {
          labels,
          datasets: [
            {
              label: '動画尺（秒）',
              data: videos.map(video => video.duration),
              borderColor: 'rgb(199, 199, 199)',
              backgroundColor: 'rgba(199, 199, 199, 0.2)',
              tension: 0.1,
            },
          ],
        };
      case 'engagement':
        return {
          labels,
          datasets: [
            {
              label: 'いいね数',
              data: videos.map(video => video.likes),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
            {
              label: 'コメント数',
              data: videos.map(video => video.comments),
              backgroundColor: 'rgba(255, 206, 86, 0.6)',
            },
            {
              label: 'シェア数',
              data: videos.map(video => video.shares),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'views': return '再生回数の推移';
      case 'likes': return 'いいね数の推移';
      case 'comments': return 'コメント数の推移';
      case 'shares': return 'シェア数の推移';
      case 'followers': return '新規フォロワー数の推移';
      case 'watchTime': return '平均閲覧時間の推移';
      case 'duration': return '動画尺の推移';
      case 'engagement': return 'エンゲージメント指標の比較';
      default: return 'データ推移';
    }
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
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          aria-label="chart type"
          sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            '& .MuiToggleButton-root': {
              fontSize: '0.875rem',
              padding: '6px 12px',
            }
          }}
        >
          <ToggleButton value="views">再生回数</ToggleButton>
          <ToggleButton value="likes">いいね数</ToggleButton>
          <ToggleButton value="comments">コメント数</ToggleButton>
          <ToggleButton value="shares">シェア数</ToggleButton>
          <ToggleButton value="followers">フォロワー数</ToggleButton>
          <ToggleButton value="watchTime">閲覧時間</ToggleButton>
          <ToggleButton value="duration">動画尺</ToggleButton>
          <ToggleButton value="engagement">総合比較</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ 
        backgroundColor: 'white', 
        p: 2, 
        borderRadius: 1, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: '400px'
      }}>
        {chartType === 'engagement' ? (
          <Bar data={getChartData()} options={options} />
        ) : (
          <Line data={getChartData()} options={options} />
        )}
      </Box>
    </Box>
  );
};