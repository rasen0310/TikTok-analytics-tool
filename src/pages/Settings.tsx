import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import { tiktokClient } from '../lib/tiktok';
import { useAuth } from '../contexts/AuthContext';

interface SettingsData {
  name: string;
  email: string;
  tiktokClientKey: string;
  tiktokAccessToken: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const Settings: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [showAccessToken, setShowAccessToken] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = React.useState(false);
  const [apiStatus, setApiStatus] = React.useState(tiktokClient.getStatus());
  const { user, updateProfile, changePassword } = useAuth();
  const [formData, setFormData] = React.useState<SettingsData>({
    name: '',
    email: '',
    tiktokClientKey: '',
    tiktokAccessToken: '',
  });

  const [passwordData, setPasswordData] = React.useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = React.useState<Partial<SettingsData>>({});
  const [passwordErrors, setPasswordErrors] = React.useState<Partial<PasswordChangeData>>({});

  // Load saved settings on component mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('tiktokAnalyticsSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setFormData({
        name: parsedSettings.name || user?.name || '',
        email: parsedSettings.email || user?.email || '',
        tiktokClientKey: parsedSettings.tiktokClientKey || '',
        tiktokAccessToken: parsedSettings.tiktokAccessToken || '',
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
    
    // APIステータスを初期化
    setApiStatus(tiktokClient.getStatus());
  }, [user]);

  const handleChange = (field: keyof SettingsData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
    setSaved(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SettingsData> = {};

    if (!formData.name.trim()) {
      newErrors.name = '名前を入力してください';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        // プロフィール情報を更新
        await updateProfile(formData.name, formData.email);
        
        // ローカルストレージにAPI設定を保存
        localStorage.setItem('tiktokAnalyticsSettings', JSON.stringify(formData));
        
        // TikTokクライアントを再初期化（APIキーが変更された場合）
        tiktokClient.reinitialize();
        setApiStatus(tiktokClient.getStatus());
        
        setSaved(true);
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSaved(false), 3000);
      } catch (error) {
        console.error('プロフィール更新エラー:', error);
      }
    }
  };


  const handleClickShowAccessToken = () => {
    setShowAccessToken(!showAccessToken);
  };

  const handlePasswordChange = (field: keyof PasswordChangeData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordData({
      ...passwordData,
      [field]: event.target.value,
    });
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors({
        ...passwordErrors,
        [field]: undefined,
      });
    }
    setPasswordChangeSuccess(false);
  };

  const validatePasswordChange = (): boolean => {
    const newErrors: Partial<PasswordChangeData> = {};

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = '現在のパスワードを入力してください';
    }

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = '新しいパスワードを入力してください';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'パスワードは6文字以上で入力してください';
    }

    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'パスワード確認を入力してください';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSave = async () => {
    if (validatePasswordChange()) {
      try {
        await changePassword(passwordData.currentPassword, passwordData.newPassword);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordChangeSuccess(true);
        setTimeout(() => setPasswordChangeSuccess(false), 3000);
      } catch (error) {
        setPasswordErrors({
          currentPassword: error instanceof Error ? error.message : 'パスワード変更に失敗しました'
        });
      }
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          設定
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
              }
            }}
          >
            <Tab label="アカウント情報" />
            <Tab label="API設定" />
            <Tab label="パスワード変更" />
          </Tabs>
        </Paper>

        {tabValue === 0 && (
          <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            アカウント情報
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                基本情報
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="名前"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="山田 太郎"
                />
                <TextField
                  fullWidth
                  label="メールアドレス"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="example@email.com"
                />
              </Stack>
            </Box>


            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  backgroundColor: '#FE2C55',
                  '&:hover': {
                    backgroundColor: '#E01E45',
                  },
                }}
              >
                設定を保存
              </Button>
            </Box>

            {saved && (
              <Alert severity="success" sx={{ mt: 2 }}>
                設定が正常に保存されました
              </Alert>
            )}
          </Stack>
          </Paper>
        )}

        {tabValue === 1 && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              TikTok API設定
            </Typography>

            {/* API ステータス表示 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                現在のAPIステータス
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  label={apiStatus.mode === 'development' ? 'モックデータ' : '本番API'} 
                  color={apiStatus.mode === 'development' ? 'secondary' : 'primary'}
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  label={apiStatus.configured ? '設定済み' : '未設定'} 
                  color={apiStatus.configured ? 'success' : 'warning'}
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  label={`Client: ${apiStatus.clientType}`} 
                  variant="outlined"
                  size="small"
                />
              </Stack>
              
              {apiStatus.mode === 'development' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  現在モックデータを使用しています。実際のTikTok APIを使用するには、下記のClient Keyを設定してください。
                </Alert>
              )}
              
              {apiStatus.mode === 'production' && !apiStatus.hasAccessToken && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  本番APIモードですが、アクセストークンが設定されていません。TikTok連携タブでOAuth認証を完了してください。
                </Alert>
              )}
            </Box>

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                  TikTok for Developers 設定
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>開発者向け情報:</strong> TikTok for Developersで取得したClient Keyを入力してください。
                  設定することで本番APIに自動切り替わります。未設定の場合はモックデータを使用します。
                </Alert>
                
                <TextField
                  fullWidth
                  label="Client Key"
                  value={formData.tiktokClientKey}
                  onChange={handleChange('tiktokClientKey')}
                  error={!!errors.tiktokClientKey}
                  helperText={errors.tiktokClientKey || 'TikTok for Developersで取得したClient Keyを入力'}
                  placeholder="aw***********************"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ApiIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                  アクセストークン（OAuth認証後に自動設定）
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  このトークンはTikTok連携タブでOAuth認証を完了すると自動的に設定されます。
                  手動での編集は推奨されません。
                </Alert>
                
                <TextField
                  fullWidth
                  label="Access Token"
                  type={showAccessToken ? 'text' : 'password'}
                  value={formData.tiktokAccessToken}
                  onChange={handleChange('tiktokAccessToken')}
                  error={!!errors.tiktokAccessToken}
                  helperText="OAuth認証完了後に自動設定されます"
                  placeholder="••••••••••••••••••••••••••••••••"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle access token visibility"
                          onClick={handleClickShowAccessToken}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                        >
                          {showAccessToken ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

  
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    backgroundColor: '#FE2C55',
                    '&:hover': {
                      backgroundColor: '#E01E45',
                    },
                  }}
                >
                  API設定を保存
                </Button>
              </Box>

              {saved && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  API設定が正常に保存されました。システムが自動的に再初期化されました。
                </Alert>
              )}
            </Stack>
          </Paper>
        )}

        {tabValue === 2 && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              パスワード変更
            </Typography>

            <Stack spacing={3}>
              <Alert severity="info" sx={{ mb: 2 }}>
                セキュリティのため、現在のパスワードを入力してから新しいパスワードを設定してください。
              </Alert>

              <TextField
                fullWidth
                label="現在のパスワード"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword}
                placeholder="現在のパスワードを入力"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle current password visibility"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="新しいパスワード"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange('newPassword')}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword || '6文字以上で入力してください'}
                placeholder="新しいパスワードを入力"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle new password visibility"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="新しいパスワード（確認）"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
                placeholder="新しいパスワードを再入力"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handlePasswordSave}
                  sx={{
                    backgroundColor: '#FE2C55',
                    '&:hover': {
                      backgroundColor: '#E01E45',
                    },
                  }}
                >
                  パスワードを変更
                </Button>
              </Box>

              {passwordChangeSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  パスワードが正常に変更されました
                </Alert>
              )}
            </Stack>
          </Paper>
        )}

        {tabValue === 0 && (
          <Paper sx={{ p: 4, mt: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              セキュリティに関する注意事項
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • パスワードは暗号化されてローカルストレージに保存されます
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • API認証情報は外部サーバーには送信されません
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • 定期的にパスワードを変更することをお勧めします
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};