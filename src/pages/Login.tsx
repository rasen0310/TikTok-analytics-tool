import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  ContentCopy,
  Google as GoogleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleDemoLogin = () => {
    setEmail('admin@tiktok-analytics.com');
    setPassword('admin123');
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${type}をコピーしました`);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await loginWithGoogle();
      // Google OAuthはリダイレクトが発生するため、ここではnavigateしない
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Googleログインに失敗しました');
      setLoading(false);
    }
  };

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
        <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #FE2C55, #25F4EE)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TikTok Analytics
            </Typography>
            <Typography variant="body1" color="textSecondary">
              分析ツールにログインしてください
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tiktok-analytics.com"
                disabled={loading}
              />

              <TextField
                fullWidth
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LoginIcon />}
                sx={{
                  backgroundColor: '#FE2C55',
                  '&:hover': {
                    backgroundColor: '#E01E45',
                  },
                  py: 1.5,
                }}
              >
                {loading ? 'ログイン中...' : 'メールでログイン'}
              </Button>

              <Box sx={{ position: 'relative', my: 2 }}>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                  <Typography variant="body2" color="textSecondary" sx={{ px: 2 }}>
                    または
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                </Box>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleGoogleLogin}
                disabled={loading}
                startIcon={<GoogleIcon />}
                sx={{
                  borderColor: '#4285F4',
                  color: '#4285F4',
                  '&:hover': {
                    borderColor: '#357ae8',
                    backgroundColor: 'rgba(66, 133, 244, 0.04)',
                  },
                  py: 1.5,
                }}
              >
                Googleでログイン
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleDemoLogin}
                disabled={loading}
                sx={{
                  borderColor: '#FE2C55',
                  color: '#FE2C55',
                  '&:hover': {
                    borderColor: '#E01E45',
                    backgroundColor: 'rgba(254, 44, 85, 0.04)',
                  },
                }}
              >
                デモアカウントを入力
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 4, p: 2, backgroundColor: 'rgba(254, 44, 85, 0.04)', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
              <strong>デモアカウント:</strong>
            </Typography>
            
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  <strong>メール:</strong> admin@tiktok-analytics.com
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleCopy('admin@tiktok-analytics.com', 'メールアドレス')}
                  sx={{ ml: 1, color: '#FE2C55' }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  <strong>パスワード:</strong> admin123
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleCopy('admin123', 'パスワード')}
                  sx={{ ml: 1, color: '#FE2C55' }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
              
              {copySuccess && (
                <Typography variant="caption" color="success.main" align="center">
                  {copySuccess}
                </Typography>
              )}
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};