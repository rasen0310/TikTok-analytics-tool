import React from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import type { AnalyticsSummaryWithComparison } from '../types';

interface SummaryCardsProps {
  summary: AnalyticsSummaryWithComparison;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  // デバッグ用ログ: summaryデータの詳細確認
  console.log('📊 SummaryCards received data:', summary);
  console.log('📊 Comparison data exists:', !!summary.comparison);
  if (summary.comparison) {
    console.log('📊 Comparison details:', summary.comparison);
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  const renderComparisonChip = (comparisonValue: number, isEngagementRate: boolean = false) => {
    if (!summary.comparison) {
      console.log('🚫 No comparison data available for chip rendering');
      return null;
    }

    const isPositive = comparisonValue > 0;
    
    // デバッグ用ログ: 比較値の詳細
    console.log(`📊 Rendering comparison chip: value=${comparisonValue}, isEngagementRate=${isEngagementRate}, isPositive=${isPositive}`);
    
    // 表示閾値のチェック（開発時は0.001 = 0.001%に下げてテスト）
    const threshold = 0.001; // 本来は0.01だが、テスト用に緩くした
    if (Math.abs(comparisonValue) < threshold) {
      console.log(`⚠️ Comparison value below threshold (${threshold}): ${comparisonValue} - not displaying chip`);
      return null; // 変化が小さい場合は表示しない
    }

    const color = isPositive ? '#00B69B' : '#F93C65';
    const backgroundColor = isPositive ? 'rgba(0, 182, 155, 0.1)' : 'rgba(249, 60, 101, 0.1)';
    const icon = isPositive ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />;
    const prefix = isPositive ? '+' : '';
    
    // エンゲージメント率はパーセンテージポイント、その他は変化率
    const displayValue = isEngagementRate 
      ? `${prefix}${comparisonValue.toFixed(2)}pt` 
      : `${prefix}${comparisonValue.toFixed(1)}%`;

    console.log(`✅ Creating comparison chip: ${displayValue} (${isPositive ? 'positive' : 'negative'})`);

    return (
      <Chip
        icon={icon}
        label={displayValue}
        size="small"
        sx={{
          backgroundColor,
          color,
          fontSize: '0.75rem',
          height: '24px',
          '& .MuiChip-icon': {
            color: color,
            fontSize: '14px',
          },
          border: `1px solid ${color}`,
        }}
      />
    );
  };

  const cards = [
    { 
      title: '総再生回数', 
      value: formatNumber(summary.totalViews), 
      color: '#FF6B6B',
      comparison: summary.comparison?.totalViews,
    },
    { 
      title: '総いいね数', 
      value: formatNumber(summary.totalLikes), 
      color: '#4ECDC4',
      comparison: summary.comparison?.totalLikes,
    },
    { 
      title: '総コメント数', 
      value: formatNumber(summary.totalComments), 
      color: '#45B7D1',
      comparison: summary.comparison?.totalComments,
    },
    { 
      title: '総シェア数', 
      value: formatNumber(summary.totalShares), 
      color: '#FFA07A',
      comparison: summary.comparison?.totalShares,
    },
    { 
      title: '新規フォロワー', 
      value: formatNumber(summary.totalNewFollowers), 
      color: '#98D8C8',
      comparison: summary.comparison?.totalNewFollowers,
    },
    { 
      title: 'エンゲージメント率', 
      value: `${summary.engagementRate.toFixed(2)}%`, 
      color: '#F7DC6F',
      comparison: summary.comparison?.engagementRate,
      isEngagementRate: true,
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
        {cards.map((card, index) => {
          console.log(`📊 Rendering card "${card.title}": comparison=${card.comparison}, hasComparison=${card.comparison !== undefined}`);
          return (
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography color="textSecondary" gutterBottom variant="body2" sx={{ mb: 0 }}>
                    {card.title}
                  </Typography>
                  {card.comparison !== undefined && renderComparisonChip(card.comparison, card.isEngagementRate)}
                </Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};