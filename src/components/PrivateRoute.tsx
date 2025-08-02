import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  CircularProgress, 
  Container,
  Paper,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, loginWithGoogle } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setError('');
    
    try {
      await loginWithGoogle();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Googleログインに失敗しました');
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress 
          sx={{ 
            color: '#FE2C55' 
          }} 
        />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper sx={{ p: 6, width: '100%', maxWidth: 450, textAlign: 'center' }}>
            <Box sx={{ mb: 6 }}>
              <Typography 
                variant="h3" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #FE2C55, #25F4EE)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}
              >
                TikTok Analytics
              </Typography>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
                ソーシャルメディア分析ツール
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Googleアカウントでログインして、
                <br />
                TikTokのデータ分析を始めてください
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              startIcon={<GoogleIcon />}
              sx={{
                backgroundColor: '#4285F4',
                color: 'white',
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#357ae8',
                },
                '&:disabled': {
                  backgroundColor: 'grey.400',
                },
              }}
            >
              {authLoading ? 'ログイン中...' : 'Googleでログイン'}
            </Button>

            <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(66, 133, 244, 0.04)', borderRadius: 2 }}>
              <Typography variant="body2" color="textSecondary" align="center">
                🔒 セキュアで安全なGoogle OAuth認証を使用しています
              </Typography>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                ご利用にあたって、
                <Link 
                  to="/privacy-policy" 
                  style={{ 
                    color: '#FE2C55', 
                    textDecoration: 'none',
                    fontWeight: 'medium'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.textDecoration = 'underline'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.textDecoration = 'none'}
                >
                  プライバシーポリシー
                </Link>
                をご確認ください
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return <>{children}</>;
};