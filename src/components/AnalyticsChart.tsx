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

type ChartType = 'views' | 'engagement' | 'followers';

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
      case 'followers':
        return {
          labels,
          datasets: [
            {
              label: '新規フォロワー',
              data: videos.map(video => video.newFollowers),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
            },
          ],
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: chartType === 'views' ? '再生回数の推移' : 
              chartType === 'engagement' ? 'エンゲージメント指標' : 
              '新規フォロワー数の推移',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        データ可視化
      </Typography>
      
      <ToggleButtonGroup
        value={chartType}
        exclusive
        onChange={handleChartTypeChange}
        aria-label="chart type"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="views">再生回数</ToggleButton>
        <ToggleButton value="engagement">エンゲージメント</ToggleButton>
        <ToggleButton value="followers">フォロワー</ToggleButton>
      </ToggleButtonGroup>

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