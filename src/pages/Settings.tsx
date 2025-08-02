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
  InputAdornment,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
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

export const Settings: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [saved, setSaved] = React.useState(false);
  const [apiStatus, setApiStatus] = React.useState(tiktokClient.getStatus());
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = React.useState<SettingsData>({
    name: '',
    email: '',
    tiktokClientKey: '',
    tiktokAccessToken: '',
  });

  const [errors, setErrors] = React.useState<Partial<SettingsData>>({});

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
    
    // 保存されたAPI設定を読み込み
    const savedApiSettings = localStorage.getItem('tiktok-api-settings');
    if (savedApiSettings) {
      const apiSettings = JSON.parse(savedApiSettings);
      setFormData(prev => ({
        ...prev,
        tiktokClientKey: apiSettings.clientKey || '',
        tiktokAccessToken: apiSettings.accessToken || '',
      }));
    }
  }, [user]);

  const handleChange = (field: keyof SettingsData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const validate = () => {
    const newErrors: Partial<SettingsData> = {};

    if (!formData.name.trim()) {
      newErrors.name = '名前を入力してください';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        await updateProfile(formData.name, formData.email);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (error) {
        console.error('Profile update failed:', error);
      }
    }
  };

  const handleApiSave = () => {
    // API設定をローカルストレージに保存
    const apiSettings = {
      clientKey: formData.tiktokClientKey,
      accessToken: formData.tiktokAccessToken,
    };
    
    localStorage.setItem('tiktok-api-settings', JSON.stringify(apiSettings));
    
    // 環境変数を設定（開発環境用）
    if (formData.tiktokClientKey) {
      // 注意: ブラウザでは環境変数を直接設定できないため、
      // 実際の環境ではサーバー再起動が必要です
      console.log('TikTok Client Key saved to localStorage');
    }
    
    setApiStatus(tiktokClient.getStatus());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '1rem',
              }
            }}
          >
            <Tab label="アカウント情報" />
            <Tab label="API設定" />
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
                <Alert severity="info" sx={{ mb: 2 }}>
                  Google OAuthで認証されたアカウント情報です。名前は変更可能ですが、メールアドレスはGoogleアカウントと連動しています。
                </Alert>
                
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="名前"
                    value={formData.name}
                    onChange={handleChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                  
                  <TextField
                    fullWidth
                    label="メールアドレス"
                    value={formData.email}
                    onChange={handleChange('email')}
                    error={!!errors.email}
                    helperText={errors.email || 'Googleアカウントのメールアドレス'}
                    disabled
                  />
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    backgroundColor: '#FE2C55',
                    '&:hover': {
                      backgroundColor: '#E01E45',
                    },
                  }}
                >
                  変更を保存
                </Button>
                
                {saved && (
                  <Alert severity="success" sx={{ ml: 2 }}>
                    設定を保存しました
                  </Alert>
                )}
              </Box>
            </Stack>
          </Paper>
        )}

        {tabValue === 1 && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              TikTok API設定
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                API状態
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  label={apiStatus.mode === 'development' ? 'モックモード' : '本番モード'} 
                  color={apiStatus.mode === 'development' ? 'warning' : 'success'}
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleApiSave}
                  sx={{
                    backgroundColor: '#FE2C55',
                    '&:hover': {
                      backgroundColor: '#E01E45',
                    },
                  }}
                >
                  API設定を保存
                </Button>
                
                {saved && (
                  <Alert severity="success" sx={{ ml: 2 }}>
                    API設定を保存しました
                  </Alert>
                )}
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>
    </Container>
  );
};