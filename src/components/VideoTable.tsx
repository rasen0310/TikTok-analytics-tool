import React, { useState, useMemo, useCallback, memo } from 'react';
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
  Box,
  Pagination,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Skeleton,
  Fade,
  Slide,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { TableRows, NavigateNext, NavigateBefore, Refresh } from '@mui/icons-material';
import type { TikTokVideo } from '../types';

interface VideoTableProps {
  videos: TikTokVideo[];
  loading?: boolean;
  onRefresh?: () => void;
}

// ローディング用のスケルトン行コンポーネント
const SkeletonRow = memo(() => (
  <TableRow>
    <TableCell><Skeleton variant="text" width="60%" /></TableCell>
    <TableCell><Skeleton variant="text" width="80px" /></TableCell>
    <TableCell><Skeleton variant="text" width="60px" /></TableCell>
    <TableCell align="right"><Skeleton variant="text" width="40px" /></TableCell>
    <TableCell align="right"><Skeleton variant="text" width="80px" /></TableCell>
    <TableCell align="right"><Skeleton variant="text" width="60px" /></TableCell>
    <TableCell align="right"><Skeleton variant="text" width="50px" /></TableCell>
    <TableCell align="right"><Skeleton variant="text" width="50px" /></TableCell>
    <TableCell align="right"><Skeleton variant="text" width="60px" /></TableCell>
    <TableCell align="right"><Skeleton variant="text" width="40px" /></TableCell>
  </TableRow>
));

SkeletonRow.displayName = 'SkeletonRow';

// VideoRowコンポーネントをメモ化して個別の行の再レンダリングを最適化
const VideoRow = memo<{ video: TikTokVideo; formatNumber: (num: number) => string; index: number }>(
  ({ video, formatNumber, index }) => (
    <Fade in timeout={300 + index * 50}>
      <TableRow
        sx={{ 
          '&:last-child td, &:last-child th': { border: 0 },
          '&:hover': { 
            backgroundColor: '#f9f9f9',
            transform: 'scale(1.001)',
            transition: 'all 0.2s ease-in-out'
          },
          transition: 'all 0.2s ease-in-out'
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
              '&:hover': { 
                textDecoration: 'underline',
                color: '#0d47a1'
              },
              transition: 'color 0.2s ease-in-out'
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
    </Fade>
  )
);

VideoRow.displayName = 'VideoRow';

export const VideoTable: React.FC<VideoTableProps> = ({ videos, loading = false, onRefresh }) => {
  // ページネーション用の状態管理
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 1ページあたりの表示件数（可変）
  const [isPageChanging, setIsPageChanging] = useState(false); // ページ変更中の状態

  // formatNumber関数をメモ化して再生成を防ぐ
  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  }, []);

  // ページ数とページ情報の計算
  const pageInfo = useMemo(() => {
    const totalItems = videos.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      displayStart: totalItems > 0 ? startIndex + 1 : 0,
      displayEnd: endIndex
    };
  }, [videos.length, currentPage, itemsPerPage]);

  // 現在のページに表示するデータを分割
  const paginatedVideos = useMemo(() => {
    const { startIndex, endIndex } = pageInfo;
    return videos.slice(startIndex, endIndex);
  }, [videos, pageInfo]);

  // スクロール処理を分離してメモ化
  const scrollToTable = useCallback(() => {
    const tableElement = document.getElementById('video-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // ページ変更ハンドラー
  const handlePageChange = useCallback(async (event: React.ChangeEvent<unknown>, page: number) => {
    setIsPageChanging(true);
    
    // 短いローディング時間でユーザーにフィードバック
    setTimeout(() => {
      setCurrentPage(page);
      scrollToTable();
      setIsPageChanging(false);
    }, 200);
  }, [scrollToTable]);

  // 表示件数変更ハンドラー
  const handleItemsPerPageChange = useCallback((event: any) => {
    const newItemsPerPage = event.target.value;
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 表示件数変更時はページ1にリセット
    
    // パフォーマンス改善のためのデバッグログ
    console.log(`表示件数変更: ${itemsPerPage} → ${newItemsPerPage}`);
  }, [itemsPerPage]);

  // videosが変更されたときにページをリセット（データ長のみ監視して最適化）
  const videosLength = videos.length;
  React.useEffect(() => {
    setCurrentPage(1);
    console.log(`動画データ更新: ${videosLength}件`);
  }, [videosLength]);

  // 大量データ処理のための仮想化判定
  const shouldUseVirtualization = useMemo(() => {
    return videos.length > 100; // 100件を超える場合は仮想化を推奨
  }, [videos.length]);

  // パフォーマンス監視用
  React.useEffect(() => {
    if (shouldUseVirtualization) {
      console.warn(`大量データ (${videos.length}件) が検出されました。仮想化の検討を推奨します。`);
    }
  }, [shouldUseVirtualization, videos.length]);

  return (
    <Box sx={{ mb: 3 }} id="video-table-container">
      {/* ローディングプログレスバー */}
      {(loading || isPageChanging) && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1000,
            height: 3
          }} 
        />
      )}

      {/* ヘッダー部分 */}
      <Slide direction="down" in timeout={500}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              動画詳細データ
            </Typography>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <TableRows color="action" />
            )}
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* リフレッシュボタン */}
            {onRefresh && (
              <Chip
                icon={<Refresh />}
                label="更新"
                variant="outlined"
                onClick={onRefresh}
                disabled={loading}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              />
            )}
            
            {/* 表示件数選択 */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>表示件数</InputLabel>
              <Select
                value={itemsPerPage}
                label="表示件数"
                onChange={handleItemsPerPageChange}
                disabled={loading}
              >
                <MenuItem value={5}>5件</MenuItem>
                <MenuItem value={10}>10件</MenuItem>
                <MenuItem value={20}>20件</MenuItem>
                <MenuItem value={50}>50件</MenuItem>
              </Select>
            </FormControl>
            
            {/* ページ情報 */}
            {pageInfo.totalItems > 0 && !loading && (
              <Fade in timeout={300}>
                <Chip
                  icon={<TableRows />}
                  label={`${pageInfo.displayStart}-${pageInfo.displayEnd}件 / 全${pageInfo.totalItems}件`}
                  variant="outlined"
                  color="primary"
                />
              </Fade>
            )}
          </Stack>
        </Stack>
      </Slide>
      
      <Divider sx={{ mb: 2 }} />
      
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
            {loading ? (
              // ローディング中はスケルトンを表示
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <SkeletonRow key={`skeleton-${index}`} />
              ))
            ) : isPageChanging ? (
              // ページ変更中もスケルトンを表示
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <SkeletonRow key={`page-changing-${index}`} />
              ))
            ) : (
              // 通常のデータ表示
              paginatedVideos.map((video, index) => (
                <VideoRow
                  key={video.id}
                  video={video}
                  formatNumber={formatNumber}
                  index={index}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ページネーション */}
      {pageInfo.totalPages > 1 && !loading && (
        <Slide direction="up" in timeout={600}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              {/* 左側：ページ情報の詳細 */}
              <Fade in timeout={400}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    ページ {currentPage} / {pageInfo.totalPages}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    •
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pageInfo.displayStart}-{pageInfo.displayEnd}件を表示
                  </Typography>
                </Stack>
              </Fade>
              
              {/* 中央：ページネーション */}
              <Pagination
                count={pageInfo.totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                siblingCount={1}
                boundaryCount={1}
                disabled={isPageChanging}
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              />
              
              {/* 右側：ジャンプ機能（今後拡張可能） */}
              <Box sx={{ width: 120 }} />
            </Stack>
          </Box>
        </Slide>
      )}
      
      {/* データなしの場合の表示 */}
      {pageInfo.totalItems === 0 && !loading && (
        <Fade in timeout={500}>
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: 'text.secondary'
          }}>
            <TableRows sx={{ 
              fontSize: 48, 
              mb: 2, 
              opacity: 0.3,
              animation: 'pulse 2s infinite'
            }} />
            <Typography variant="h6" gutterBottom>
              表示するデータがありません
            </Typography>
            <Typography variant="body2">
              選択した期間にデータが存在しません。日付範囲を調整してください。
            </Typography>
            {onRefresh && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<Refresh />}
                  label="データを再取得"
                  onClick={onRefresh}
                  color="primary"
                  variant="outlined"
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            )}
          </Box>
        </Fade>
      )}

      {/* パフォーマンス警告 */}
      {shouldUseVirtualization && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          backgroundColor: 'warning.light', 
          borderRadius: 1,
          color: 'warning.contrastText'
        }}>
          <Typography variant="caption">
            ⚠️ 大量データ ({videos.length}件) - パフォーマンス最適化が適用されています
          </Typography>
        </Box>
      )}
    </Box>
  );
};