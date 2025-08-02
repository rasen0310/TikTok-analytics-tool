import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TikTokAuthProvider } from './contexts/TikTokAuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CompetitorAnalysis } from './pages/CompetitorAnalysis';
import { AIReport } from './pages/AIReport';
import { DataTable } from './pages/DataTable';
import { TikTokCallback } from './pages/TikTokCallback';
import { PrivacyPolicy } from './pages/PrivacyPolicy';

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#FE2C55',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h3: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <TikTokAuthProvider>
          <BrowserRouter>
            <Routes>
              {/* パブリックルート */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              
              {/* TikTok OAuth コールバック用ルート */}
              <Route 
                path="/auth/tiktok/callback" 
                element={
                  <PrivateRoute>
                    <TikTokCallback />
                  </PrivateRoute>
                } 
              />
              
              {/* メインアプリケーションルート */}
              <Route path="/" element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="competitor" element={<CompetitorAnalysis />} />
                <Route path="ai-report" element={<AIReport />} />
                <Route path="data-table" element={<DataTable />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TikTokAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
