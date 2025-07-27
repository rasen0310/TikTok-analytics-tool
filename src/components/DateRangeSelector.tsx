import React from 'react';
import { 
  Box, 
  ToggleButton, 
  ToggleButtonGroup,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { DateRangePreset } from '../types';

interface DateRangeSelectorProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onDateRangeChange }) => {
  const [preset, setPreset] = React.useState<DateRangePreset>('7days');
  const [customStartDate, setCustomStartDate] = React.useState<Dayjs | null>(null);
  const [customEndDate, setCustomEndDate] = React.useState<Dayjs | null>(null);

  const handlePresetChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPreset: DateRangePreset | null
  ) => {
    if (newPreset !== null) {
      setPreset(newPreset);
      
      const endDate = dayjs();
      let startDate: Dayjs;
      
      switch (newPreset) {
        case '7days':
          startDate = endDate.subtract(7, 'day');
          break;
        case '14days':
          startDate = endDate.subtract(14, 'day');
          break;
        case '21days':
          startDate = endDate.subtract(21, 'day');
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            onDateRangeChange(
              customStartDate.format('YYYY-MM-DD'),
              customEndDate.format('YYYY-MM-DD')
            );
          }
          return;
      }
      
      onDateRangeChange(
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );
    }
  };

  const handleCustomDateChange = () => {
    if (preset === 'custom' && customStartDate && customEndDate) {
      onDateRangeChange(
        customStartDate.format('YYYY-MM-DD'),
        customEndDate.format('YYYY-MM-DD')
      );
    }
  };

  React.useEffect(() => {
    handleCustomDateChange();
  }, [customStartDate, customEndDate]);

  React.useEffect(() => {
    const endDate = dayjs();
    const startDate = endDate.subtract(7, 'day');
    onDateRangeChange(
      startDate.format('YYYY-MM-DD'),
      endDate.format('YYYY-MM-DD')
    );
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={preset}
          exclusive
          onChange={handlePresetChange}
          aria-label="date range preset"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="7days">7日間</ToggleButton>
          <ToggleButton value="14days">14日間</ToggleButton>
          <ToggleButton value="21days">21日間</ToggleButton>
          <ToggleButton value="custom">カスタム</ToggleButton>
        </ToggleButtonGroup>
        
        {preset === 'custom' && (
          <Stack direction="row" spacing={2}>
            <DatePicker
              label="開始日"
              value={customStartDate}
              onChange={(newValue) => setCustomStartDate(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="終了日"
              value={customEndDate}
              onChange={(newValue) => setCustomEndDate(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Stack>
        )}
      </Box>
    </LocalizationProvider>
  );
};