import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseDebugInfo, testDemoAccountCreation, logSupabaseAuthSettings } from '../lib/supabase-debug';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithDemo } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // コンポーネントマウント時にデバッグ情報を取得
  useEffect(() => {
    const loadDebugInfo = async () => {
      const info = await getSupabaseDebugInfo();
      setDebugInfo(info);
      logSupabaseAuthSettings();
    };
    loadDebugInfo();
  }, []);

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // デモアカウントでログイン
  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError('');

    try {
      await loginWithDemo();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'デモログインに失敗しました');
    } finally {
      setDemoLoading(false);
    }
  };

  // デモアカウント作成テスト
  const handleTestDemoAccount = async () => {
    setError('');
    console.log('🧪 デモアカウントテスト開始');
    
    try {
      const result = await testDemoAccountCreation();
      setTestResult(result);
      console.log('📊 テスト結果:', result);
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `テスト実行エラー: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #FE2C55, #25F4EE)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              TikTok Analytics
            </Typography>
            <Typography variant="h5" component="h1" gutterBottom>
              ログイン
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="メールアドレス"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="パスワード"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
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
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#FE2C55',
                '&:hover': {
                  backgroundColor: '#E01E45',
                },
              }}
              disabled={loading || demoLoading}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              sx={{
                mb: 2,
                py: 1.5,
                borderColor: '#FE2C55',
                color: '#FE2C55',
                '&:hover': {
                  borderColor: '#E01E45',
                  backgroundColor: 'rgba(254, 44, 85, 0.04)',
                },
              }}
            >
              {demoLoading ? 'デモアカウント準備中...' : 'デモアカウントでログイン'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                デモアカウント: demo@example.com / password123
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                ※ デモアカウントが存在しない場合は自動で作成されます
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* デバッグパネル */}
        <Paper sx={{ mt: 2 }}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="debug-panel-content"
              id="debug-panel-header"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugReportIcon color="action" />
                <Typography variant="subtitle2">
                  🔍 デバッグ情報 & トラブルシューティング
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ space: 2 }}>
                {/* Supabase接続状態 */}
                {debugInfo && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Supabase接続状態
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip 
                        label={debugInfo.isConnected ? '接続成功' : '接続失敗'} 
                        color={debugInfo.isConnected ? 'success' : 'error'}
                        size="small"
                      />
                      <Chip 
                        label={debugInfo.hasAnonKey ? 'APIキー設定済み' : 'APIキー未設定'} 
                        color={debugInfo.hasAnonKey ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      URL: {debugInfo.url}
                    </Typography>
                    {debugInfo.error && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        接続エラー: {debugInfo.error}
                      </Alert>
                    )}
                  </Box>
                )}

                {/* テストボタン */}
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleTestDemoAccount}
                    startIcon={<BugReportIcon />}
                    size="small"
                  >
                    デモアカウント作成テスト実行
                  </Button>
                </Box>

                {/* テスト結果 */}
                {testResult && (
                  <Box sx={{ mb: 2 }}>
                    <Alert 
                      severity={testResult.success ? 'success' : 'error'}
                      sx={{ mt: 1 }}
                    >
                      <Typography variant="subtitle2">
                        テスト結果: {testResult.success ? '成功' : '失敗'}
                      </Typography>
                      <Typography variant="body2">
                        {testResult.message}
                      </Typography>
                      {testResult.needsEmailConfirmation && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                          💡 解決方法: Supabaseプロジェクトの「Authentication → Settings」で
                          「Enable email confirmations」を無効にしてください。
                        </Typography>
                      )}
                    </Alert>
                  </Box>
                )}

                {/* よくある問題と解決方法 */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    💡 よくある問題と解決方法
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>1. メール確認が必要なエラー:</strong><br />
                    Supabase → Authentication → Settings → 「Enable email confirmations」を無効化
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>2. 接続エラー:</strong><br />
                    .env.localファイルのSupabase認証情報を確認
                  </Typography>
                  <Typography variant="body2">
                    <strong>3. デモアカウント作成失敗:</strong><br />
                    上記のテストボタンで詳細なエラー情報を確認
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Container>
    </Box>
  );
};