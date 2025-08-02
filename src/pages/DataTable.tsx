import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  PlayArrow,
  Favorite,
  Comment,
  Share,
} from '@mui/icons-material';
import { mockVideos } from '../data/mockData';
import type { TikTokVideo } from '../types';

export const DataTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredData, setFilteredData] = React.useState(mockVideos);

  React.useEffect(() => {
    const filtered = mockVideos.filter(
      (video) =>
        video.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchQuery]);

  const handleExportData = () => {
    const csvContent = [
      ['ID', '動画URL', '投稿日', '投稿時間', '再生回数', 'いいね数', 'コメント数', 'シェア数', '新規フォロワー', '平均閲覧時間'],
      ...filteredData.map(video => [
        video.id,
        video.videoUrl,
        video.postDate,
        video.postTime,
        video.views,
        video.likes,
        video.comments,
        video.shares,
        video.newFollowers,
        video.avgWatchTime
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tiktok_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  const getEngagementRate = (video: TikTokVideo) => {
    const engagement = ((video.likes + video.comments + video.shares) / video.views) * 100;
    return engagement.toFixed(2);
  };

  const getEngagementChip = (rate: number) => {
    if (rate >= 5) return <Chip label="高" color="success" size="small" />;
    if (rate >= 2) return <Chip label="中" color="warning" size="small" />;
    return <Chip label="低" color="error" size="small" />;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          読み込みデータ
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          📊 APIから読み込んだTikTokデータを表形式で表示しています。検索やフィルタリング、CSVエクスポートが可能です。
        </Alert>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <TextField
              placeholder="動画IDで検索..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                sx={{
                  borderColor: '#FE2C55',
                  color: '#FE2C55',
                  '&:hover': {
                    borderColor: '#E01E45',
                    backgroundColor: 'rgba(254, 44, 85, 0.04)',
                  },
                }}
              >
                更新
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportData}
                sx={{
                  backgroundColor: '#FE2C55',
                  '&:hover': {
                    backgroundColor: '#E01E45',
                  },
                }}
              >
                CSVエクスポート
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>動画ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>動画URL</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>投稿日</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>投稿時間</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <PlayArrow fontSize="small" />
                      再生回数
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Favorite fontSize="small" />
                      いいね
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Comment fontSize="small" />
                      コメント
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Share fontSize="small" />
                      シェア
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>新規フォロワー</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>平均閲覧時間(秒)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>エンゲージメント率</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((video) => {
                  const engagementRate = parseFloat(getEngagementRate(video));
                  return (
                    <TableRow
                      key={video.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(254, 44, 85, 0.04)',
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                          {video.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ maxWidth: 200 }}>
                          <Typography variant="body2" sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'primary.main'
                          }}>
                            {video.videoUrl}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{video.postDate}</TableCell>
                      <TableCell>{video.postTime}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatNumber(video.views)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatNumber(video.likes)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatNumber(video.comments)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatNumber(video.shares)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatNumber(video.newFollowers)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {video.avgWatchTime.toFixed(1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {engagementRate}%
                          </Typography>
                          {getEngagementChip(engagementRate)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            表示件数: {filteredData.length} / {mockVideos.length} 件
          </Typography>
          <Typography variant="caption" color="textSecondary">
            最終更新: {new Date().toLocaleString('ja-JP')}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};