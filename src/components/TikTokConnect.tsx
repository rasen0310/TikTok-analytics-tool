import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Sync as SyncIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useTikTokAuth } from '../hooks/useTikTokAuth';

export const TikTokConnect: React.FC = () => {
  const {
    loading,
    accounts,
    startTikTokAuth,
    fetchTikTokAccounts,
    deactivateAccount,
    refreshTokens,
    syncAccountData,
    isConfigured,
  } = useTikTokAuth();

  useEffect(() => {
    fetchTikTokAccounts();
  }, [fetchTikTokAccounts]);

  const handleConnect = async () => {
    try {
      await startTikTokAuth();
    } catch (error) {
      console.error('TikTok接続エラー:', error);
    }
  };

  const handleSync = async (accountId: string) => {
    try {
      await syncAccountData(accountId);
    } catch (error) {
      console.error('同期エラー:', error);
    }
  };

  const handleRefreshToken = async (accountId: string) => {
    try {
      await refreshTokens(accountId);
    } catch (error) {
      console.error('トークン更新エラー:', error);
    }
  };

  const handleDeactivate = async (accountId: string) => {
    if (window.confirm('このTikTokアカウントとの連携を解除しますか？')) {
      try {
        await deactivateAccount(accountId);
      } catch (error) {
        console.error('連携解除エラー:', error);
      }
    }
  };

  if (!isConfigured) {
    return (
      <Alert severity="warning">
        TikTok APIの設定が完了していません。環境変数 VITE_TIKTOK_CLIENT_KEY を設定してください。
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          TikTokアカウント連携
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleConnect}
          disabled={loading}
          sx={{
            backgroundColor: '#FE2C55',
            '&:hover': {
              backgroundColor: '#E01E45',
            },
          }}
        >
          TikTokアカウントを連携
        </Button>
      </Box>

      {accounts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              TikTokアカウントが連携されていません
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              TikTokアカウントを連携すると、動画の分析データを自動取得できます
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleConnect}
              disabled={loading}
            >
              最初のアカウントを連携
            </Button>
          </CardContent>
        </Card>
      ) : (
        <List>
          {accounts.map((account) => (
            <ListItem key={account.id}>
              <ListItemAvatar>
                <Avatar
                  src={account.avatar_url}
                  alt={account.display_name || account.tiktok_username}
                >
                  {(account.display_name || account.tiktok_username)[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      {account.display_name || account.tiktok_username}
                    </Typography>
                    {account.is_active ? (
                      <Chip
                        icon={account.token_valid ? <CheckCircleIcon /> : <WarningIcon />}
                        label={account.token_valid ? '認証済み' : 'トークン期限切れ'}
                        size="small"
                        color={account.token_valid ? 'success' : 'warning'}
                      />
                    ) : (
                      <Chip label="非アクティブ" size="small" color="default" />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      @{account.tiktok_username}
                    </Typography>
                    {account.last_synced && (
                      <Typography variant="caption" color="textSecondary">
                        最終同期: {new Date(account.last_synced).toLocaleString('ja-JP')}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {account.is_active && (
                    <>
                      <IconButton
                        edge="end"
                        onClick={() => handleSync(account.id)}
                        disabled={loading}
                        title="データを同期"
                      >
                        {loading ? <CircularProgress size={20} /> : <SyncIcon />}
                      </IconButton>
                      {!account.token_valid && (
                        <IconButton
                          edge="end"
                          onClick={() => handleRefreshToken(account.id)}
                          disabled={loading}
                          title="トークンを更新"
                          color="warning"
                        >
                          <WarningIcon />
                        </IconButton>
                      )}
                    </>
                  )}
                  <IconButton
                    edge="end"
                    onClick={() => handleDeactivate(account.id)}
                    disabled={loading}
                    title="連携を解除"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>注意:</strong> TikTokアカウントを連携すると、以下の情報にアクセスできるようになります：
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>基本プロフィール情報</li>
          <li>動画一覧と統計データ</li>
          <li>パフォーマンス分析データ</li>
        </ul>
        <Typography variant="body2">
          この情報は分析目的でのみ使用され、第三者と共有されることはありません。
        </Typography>
      </Alert>
    </Box>
  );
};