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
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Google as GoogleIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTikTokAuth } from '../contexts/TikTokAuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { 
    isConnected, 
    user: tiktokUser, 
    loading: tiktokLoading, 
    error: tiktokError,
    connectTikTok, 
    disconnectTikTok 
  } = useTikTokAuth();

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

        {/* TikTok連携セクション */}
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            TikTok連携
          </Typography>

          {tiktokError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {tiktokError}
            </Alert>
          )}

          {isConnected && tiktokUser ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                TikTokアカウントが正常に連携されています
              </Alert>
              
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Avatar 
                  src={tiktokUser.avatar_url_100}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2,
                    border: '3px solid #FE2C55'
                  }}
                >
                  {tiktokUser.display_name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {tiktokUser.display_name}
                  </Typography>
                  {tiktokUser.is_verified && (
                    <VerifiedIcon sx={{ color: '#20D5EC', fontSize: 20 }} />
                  )}
                </Box>
                <Typography variant="body2" color="textSecondary">
                  @{tiktokUser.open_id}
                </Typography>
              </Box>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip 
                    label={`フォロワー: ${tiktokUser.follower_count?.toLocaleString() || 0}`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip 
                    label={`フォロー中: ${tiktokUser.following_count?.toLocaleString() || 0}`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip 
                    label={`いいね: ${tiktokUser.likes_count?.toLocaleString() || 0}`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip 
                    label={`動画数: ${tiktokUser.video_count?.toLocaleString() || 0}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                
                {tiktokUser.bio_description && (
                  <TextField
                    fullWidth
                    label="プロフィール"
                    value={tiktokUser.bio_description}
                    disabled
                    multiline
                    maxRows={3}
                  />
                )}
              </Stack>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={disconnectTikTok}
                  disabled={tiktokLoading}
                  startIcon={tiktokLoading ? <CircularProgress size={16} /> : <LinkOffIcon />}
                  sx={{
                    borderColor: '#FE2C55',
                    color: '#FE2C55',
                    '&:hover': {
                      borderColor: '#E01E45',
                      backgroundColor: 'rgba(254, 44, 85, 0.04)',
                    },
                  }}
                >
                  {tiktokLoading ? '処理中...' : 'TikTok連携を解除'}
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                TikTokアカウントを連携すると、実際のデータを使用した分析が可能になります。
                現在はモックデータを使用しています。
              </Alert>
              
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
                  TikTokアカウントと連携して、リアルタイムデータ分析を始めましょう
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={connectTikTok}
                  disabled={tiktokLoading}
                  startIcon={tiktokLoading ? <CircularProgress size={20} color="inherit" /> : <LinkIcon />}
                  sx={{
                    backgroundColor: '#FE2C55',
                    color: 'white',
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#E01E45',
                    },
                    '&:disabled': {
                      backgroundColor: 'grey.400',
                    },
                  }}
                >
                  {tiktokLoading ? 'TikTokに接続中...' : 'TikTokアカウントを連携'}
                </Button>
              </Box>

              <Box sx={{ mt: 3, p: 3, backgroundColor: 'rgba(254, 44, 85, 0.04)', borderRadius: 2 }}>
                <Typography variant="body2" color="textSecondary" align="center">
                  <strong>連携について:</strong>
                  <br />
                  • 基本プロフィール情報とパブリック統計のみアクセスします
                  <br />
                  • 動画の投稿や編集は一切行いません
                  <br />
                  • 連携はいつでも解除できます
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};