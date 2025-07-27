import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Typography,
  Box
} from '@mui/material';
import type { TikTokVideo } from '../types';

interface VideoTableProps {
  videos: TikTokVideo[];
}

export const VideoTable: React.FC<VideoTableProps> = ({ videos }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        動画詳細データ
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table sx={{ minWidth: 650 }} aria-label="TikTok videos table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>動画URL</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>投稿日</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>投稿時間</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>動画尺（秒）</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>再生回数</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>いいね数</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>コメント数</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>シェア数</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>新規フォロワー</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>平均閲覧時間</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videos.map((video) => (
              <TableRow
                key={video.id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { backgroundColor: '#f9f9f9' }
                }}
              >
                <TableCell component="th" scope="row">
                  <Link 
                    href={video.videoUrl} 
                    target="_blank" 
                    rel="noopener"
                    sx={{ 
                      color: '#1976d2',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {video.videoUrl.length > 30 
                      ? `${video.videoUrl.substring(0, 30)}...` 
                      : video.videoUrl
                    }
                  </Link>
                </TableCell>
                <TableCell>{video.postDate}</TableCell>
                <TableCell>{video.postTime}</TableCell>
                <TableCell align="right">{video.duration}</TableCell>
                <TableCell align="right">{formatNumber(video.views)}</TableCell>
                <TableCell align="right">{formatNumber(video.likes)}</TableCell>
                <TableCell align="right">{formatNumber(video.comments)}</TableCell>
                <TableCell align="right">{formatNumber(video.shares)}</TableCell>
                <TableCell align="right">{formatNumber(video.newFollowers)}</TableCell>
                <TableCell align="right">{video.avgWatchTime}秒</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};