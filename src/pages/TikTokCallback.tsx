import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Container } from '@mui/material';
import { useTikTokAuth } from '../contexts/TikTokAuthContext';

export const TikTokCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback } = useTikTokAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // エラーがある場合
      if (errorParam) {
        const errorMessage = errorDescription || errorParam;
        setError(`TikTok認証がキャンセルされました: ${errorMessage}`);
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }

      // コードまたはstateが無い場合
      if (!code || !state) {
        setError('認証パラメータが不正です');
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }

      try {
        await handleCallback(code, state);
        
        // 成功時はダッシュボードにリダイレクト
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
        
      } catch (error) {
        console.error('TikTok OAuth callback error:', error);
        setError(error instanceof Error ? error.message : 'TikTok認証に失敗しました');
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate]);

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              認証エラー
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
          <Typography variant="body2" color="textSecondary">
            3秒後にダッシュボードに戻ります...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: '#FE2C55',
            mb: 3 
          }} 
        />
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          TikTok認証を処理中...
        </Typography>
        <Typography variant="body2" color="textSecondary">
          しばらくお待ちください
        </Typography>
        
        <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(254, 44, 85, 0.04)', borderRadius: 2 }}>
          <Typography variant="body2" color="textSecondary">
            🔄 TikTokアカウントとの連携を確立しています
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};