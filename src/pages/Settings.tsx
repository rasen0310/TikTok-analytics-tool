import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Google as GoogleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="warning">
            ユーザー情報を読み込めませんでした。再度ログインしてください。
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          設定
        </Typography>

        <Paper sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                backgroundColor: '#FE2C55',
                fontSize: '2rem'
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {user.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <GoogleIcon sx={{ color: '#4285F4' }} />
              <Typography variant="body2" color="textSecondary">
                Google アカウントで認証済み
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            アカウント情報
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Google OAuth認証により取得された情報です。これらの情報はGoogleアカウントと連動しており、変更はGoogleアカウント設定から行ってください。
          </Alert>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="表示名"
              value={user.name}
              disabled
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              helperText="Googleアカウントに登録されている名前"
            />
            
            <TextField
              fullWidth
              label="メールアドレス"
              value={user.email}
              disabled
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              helperText="Googleアカウントのメールアドレス"
            />

            <TextField
              fullWidth
              label="ユーザーID"
              value={user.id}
              disabled
              helperText="システム内部で使用される一意のID"
            />
          </Stack>

          <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(66, 133, 244, 0.04)', borderRadius: 2 }}>
            <Typography variant="body2" color="textSecondary" align="center">
              <strong>プライバシーについて:</strong> 
              <br />
              アカウント情報の変更や削除をご希望の場合は、Googleアカウント設定から行ってください。
              <br />
              アプリケーションからアカウントを削除したい場合は、ログアウト後に再度アクセスしないことで、
              <br />
              自動的にアカウント情報は保持されなくなります。
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};