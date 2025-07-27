import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';

export const CompetitorAnalysis: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <AnalyticsIcon
            sx={{
              fontSize: 80,
              color: '#FE2C55',
              mb: 3,
            }}
          />
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FE2C55, #25F4EE)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Coming Soon
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
            競合分析機能は現在開発中です
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            他のTikTokアカウントとの比較分析機能を準備しています
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};