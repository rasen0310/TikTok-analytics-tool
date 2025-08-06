import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Stack,
  Alert,
  Divider,
  IconButton,
  Button,
  TextField,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Google as GoogleIcon,
  AccountCircle as AccountCircleIcon,
  Verified as VerifiedIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    console.log(`${label} copied to clipboard: ${text}`);
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            ユーザー情報を読み込めませんでした。再度ログインしてください。
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* ヘッダー */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FE2C55, #25F4EE)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            設定
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            アカウント情報と認証設定の管理
          </Typography>
        </Box>

        {/* メインプロフィールセクション */}
        <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          {/* プロフィールヘッダー */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                mr: 3,
                backgroundColor: '#FE2C55',
                fontSize: '2.5rem',
                border: '4px solid #fff',
                boxShadow: '0 4px 20px rgba(254, 44, 85, 0.3)'
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                {user.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <GoogleIcon sx={{ color: '#4285F4', fontSize: 20 }} />
                <Typography variant="body1" color="textSecondary">
                  Google アカウントで認証済み
                </Typography>
                <VerifiedIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip 
                  label="アクティブ" 
                  color="success" 
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip 
                  label="認証済み" 
                  color="primary" 
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* アカウント詳細情報 */}
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            <AccountCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            アカウント詳細
          </Typography>

          <Stack spacing={3}>
            {/* 表示名 */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ mr: 1, color: '#FE2C55' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  表示名
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleCopyToClipboard(user.name, '表示名')}
                  sx={{ ml: 'auto', color: '#666' }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                value={user.name}
                disabled
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '1.1rem',
                    fontWeight: 'medium',
                  },
                }}
                helperText="Googleアカウントに登録されている名前"
              />
            </Box>

            {/* メールアドレス */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, color: '#FE2C55' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  メールアドレス
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleCopyToClipboard(user.email, 'メールアドレス')}
                  sx={{ ml: 'auto', color: '#666' }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                value={user.email}
                disabled
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '1.1rem',
                    fontWeight: 'medium',
                  },
                }}
                helperText="プライマリーメールアドレス"
              />
            </Box>

            {/* ユーザーID */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountCircleIcon sx={{ mr: 1, color: '#FE2C55' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  ユーザーID
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleCopyToClipboard(user.id, 'ユーザーID')}
                  sx={{ ml: 'auto', color: '#666' }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                value={user.id}
                disabled
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                  },
                }}
                helperText="システム内部で使用される一意の識別子"
              />
            </Box>
          </Stack>
        </Paper>

        {/* 認証情報カード */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            <GoogleIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#4285F4' }} />
            認証情報
          </Typography>
          
          <Alert severity="success" sx={{ mb: 2 }}>
            Google OAuth認証が正常に接続されています
          </Alert>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="body1" fontWeight="medium">
                認証状態: 
                <Chip 
                  label="接続済み" 
                  color="success" 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2" color="textSecondary">
                最終ログイン: 現在のセッション
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              sx={{
                color: '#FE2C55',
                borderColor: '#FE2C55',
                '&:hover': {
                  borderColor: '#E01E45',
                  backgroundColor: 'rgba(254, 44, 85, 0.04)',
                },
              }}
            >
              更新
            </Button>
          </Box>
        </Paper>

        {/* プライバシー・セキュリティ情報 */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            プライバシー・セキュリティ
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              アカウント情報はGoogleから安全に取得され、暗号化されて保護されています
            </Typography>
          </Alert>

          <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.8 }}>
            <strong>データ保護について:</strong>
            <br />
            • アカウント情報の変更はGoogleアカウント設定から行ってください
            <br />
            • すべてのデータは暗号化されて安全に保存されています
            <br />
            • ログアウト後はローカルに保存されたデータが自動的に削除されます
            <br />
            • 当アプリケーションではパスワード情報は一切保存していません
          </Typography>
        </Paper>

        {/* アカウント操作 */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, backgroundColor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            アカウント操作
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                backgroundColor: '#f44336',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                },
              }}
            >
              ログアウト
            </Button>
            
            <Typography variant="caption" color="textSecondary">
              ログアウトするとローカルに保存されたデータが削除されます
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};