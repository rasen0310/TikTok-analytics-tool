import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useTikTokAuth } from '../hooks/useTikTokAuth';

export const TikTokCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleAuthCallback } = useTikTokAuth();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`TikTok認証エラー: ${errorParam}`);
        setTimeout(() => navigate('/settings'), 3000);
        return;
      }

      if (!code || !state) {
        setError('認証パラメータが不正です');
        setTimeout(() => navigate('/settings'), 3000);
        return;
      }

      try {
        await handleAuthCallback(code, state);
        // 成功時は設定ページに戻る
        navigate('/settings?tiktok=connected');
      } catch (error) {
        console.error('認証コールバック処理エラー:', error);
        setError(error instanceof Error ? error.message : '認証に失敗しました');
        setTimeout(() => navigate('/settings'), 3000);
      }
    };

    processCallback();
  }, [searchParams, handleAuthCallback, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          p: 4,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: 400,
          width: '100%',
          mx: 2,
        }}
      >
        {error ? (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="textSecondary">
              3秒後に設定ページに戻ります...
            </Typography>
          </>
        ) : (
          <>
            <CircularProgress
              size={60}
              sx={{
                color: '#FE2C55',
                mb: 3,
              }}
            />
            <Typography variant="h6" gutterBottom>
              TikTokアカウントを連携中...
            </Typography>
            <Typography variant="body2" color="textSecondary">
              しばらくお待ちください
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};