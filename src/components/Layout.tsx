import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'ダッシュボード', icon: <DashboardIcon />, path: '/' },
  { text: '競合分析', icon: <AnalyticsIcon />, path: '/competitor' },
  { text: 'AIレポート', icon: <AssessmentIcon />, path: '/ai-report' },
  { text: '読み込みデータ', icon: <TableChartIcon />, path: '/data-table' },
];

export const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ fontWeight: 'bold' }}>
            TikTok Analytics
          </Typography>
        </Toolbar>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(254, 44, 85, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(254, 44, 85, 0.12)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? '#FE2C55' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color: location.pathname === item.path ? '#FE2C55' : 'inherit',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Box sx={{ flexGrow: 1 }} />
      
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h5" 
            noWrap 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FE2C55, #25F4EE)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {location.pathname === '/data-table'
              ? '読み込みデータ'
              : menuItems.find(item => item.path === location.pathname)?.text || 'TikTok Analytics'}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {user?.name}
            </Typography>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                color: '#FE2C55',
                '&:hover': {
                  backgroundColor: 'rgba(254, 44, 85, 0.04)',
                },
              }}
            >
              ログアウト
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};