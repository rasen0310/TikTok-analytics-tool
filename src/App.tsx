import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { DateRangeSelector } from './components/DateRangeSelector';
import { SummaryCards } from './components/SummaryCards';
import { VideoTable } from './components/VideoTable';
import { AnalyticsChart } from './components/AnalyticsChart';
import { mockVideos, calculateSummary } from './data/mockData';
import type { TikTokVideo, AnalyticsSummary } from './types';

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#FE2C55',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h3: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Container maxWidth="xl">
          <Box sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #FE2C55, #25F4EE)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                TikTok Analytics Dashboard
              </Typography>
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
      </Box>
    </ThemeProvider>
  );
}

export default App;
