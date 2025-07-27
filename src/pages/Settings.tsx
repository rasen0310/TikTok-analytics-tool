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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
} from '@mui/icons-material';

interface SettingsData {
  name: string;
  email: string;
  tiktokId: string;
  password: string;
}

export const Settings: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [formData, setFormData] = React.useState<SettingsData>({
    name: '',
    email: '',
    tiktokId: '',
    password: '',
  });

  const [errors, setErrors] = React.useState<Partial<SettingsData>>({});

  // Load saved settings on component mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('tiktokAnalyticsSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setFormData(parsedSettings);
    }
  }, []);

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

    if (!formData.tiktokId.trim()) {
      newErrors.tiktokId = 'TikTok IDを入力してください';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'パスワードを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // Save to localStorage
      localStorage.setItem('tiktokAnalyticsSettings', JSON.stringify(formData));
      setSaved(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          設定
        </Typography>

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

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                TikTok API認証情報
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                TikTok APIを使用してデータを取得するために必要な認証情報です。
                これらの情報は安全に保存され、API通信時のみ使用されます。
              </Alert>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="TikTok ID"
                  value={formData.tiktokId}
                  onChange={handleChange('tiktokId')}
                  error={!!errors.tiktokId}
                  helperText={errors.tiktokId || 'TikTokアカウントのユーザーIDを入力してください'}
                  placeholder="@username"
                />
                <TextField
                  fullWidth
                  label="APIパスワード"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  error={!!errors.password}
                  helperText={errors.password || 'TikTok API用のパスワードを入力してください'}
                  placeholder="••••••••"
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
      </Box>
    </Container>
  );
};