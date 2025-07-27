import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { AnalyticsSummary } from '../types';

interface SummaryCardsProps {
  summary: AnalyticsSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  const cards = [
    { title: '総再生回数', value: formatNumber(summary.totalViews), color: '#FF6B6B' },
    { title: '総いいね数', value: formatNumber(summary.totalLikes), color: '#4ECDC4' },
    { title: '総コメント数', value: formatNumber(summary.totalComments), color: '#45B7D1' },
    { title: '総シェア数', value: formatNumber(summary.totalShares), color: '#FFA07A' },
    { title: '新規フォロワー', value: formatNumber(summary.totalNewFollowers), color: '#98D8C8' },
    { 
      title: 'エンゲージメント率', 
      value: `${summary.engagementRate.toFixed(2)}%`, 
      color: '#F7DC6F' 
    }
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        概要統計
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2,
        justifyContent: 'space-between'
      }}>
        {cards.map((card, index) => (
          <Card 
            key={index} 
            sx={{ 
              minWidth: 200, 
              flex: '1 1 auto',
              borderLeft: `4px solid ${card.color}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {card.title}
              </Typography>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};