import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import { Schedule, Today, AccessTime } from '@mui/icons-material';

interface ScheduledOrderPickerProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string | null) => void;
  minDays?: number; // Minimum days from now (default: 0)
  maxDays?: number; // Maximum days ahead (default: 7)
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00',
];

const ScheduledOrderPicker: React.FC<ScheduledOrderPickerProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  minDays = 0,
  maxDays = 7,
}) => {
  const [deliveryType, setDeliveryType] = useState<'asap' | 'scheduled'>('asap');
  const [error, setError] = useState('');

  // Generate available dates
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = minDays; i <= maxDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleDeliveryTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'asap' | 'scheduled'
  ) => {
    if (newType !== null) {
      setDeliveryType(newType);
      if (newType === 'asap') {
        onDateChange(null);
        onTimeChange(null);
      }
      setError('');
    }
  };

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    onTimeChange(null); // Reset time when date changes
    setError('');
  };

  const handleTimeSelect = (time: string) => {
    if (!selectedDate) {
      setError('Please select a date first');
      return;
    }

    // Validate time is in the future
    const [hours, minutes] = time.split(':').map(Number);
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const minAdvanceTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    if (selectedDateTime < minAdvanceTime) {
      setError('Please select a time at least 1 hour from now');
      return;
    }

    onTimeChange(time);
    setError('');
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
        Delivery Time
      </Typography>

      {/* Delivery Type Toggle */}
      <ToggleButtonGroup
        value={deliveryType}
        exclusive
        onChange={handleDeliveryTypeChange}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="asap">
          <AccessTime sx={{ mr: 1 }} />
          ASAP (30-45 min)
        </ToggleButton>
        <ToggleButton value="scheduled">
          <Today sx={{ mr: 1 }} />
          Schedule for Later
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Scheduled Options */}
      {deliveryType === 'scheduled' && (
        <Box>
          {/* Date Selection */}
          <Typography variant="subtitle2" gutterBottom>
            Select Date
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {availableDates.map((date) => (
              <Chip
                key={date.toISOString()}
                label={formatDate(date)}
                onClick={() => handleDateSelect(date)}
                color={
                  selectedDate?.toDateString() === date.toDateString()
                    ? 'primary'
                    : 'default'
                }
                variant={
                  selectedDate?.toDateString() === date.toDateString()
                    ? 'filled'
                    : 'outlined'
                }
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>

          {/* Time Selection */}
          {selectedDate && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Select Time
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {TIME_SLOTS.map((time) => (
                  <Chip
                    key={time}
                    label={time}
                    onClick={() => handleTimeSelect(time)}
                    color={selectedTime === time ? 'primary' : 'default'}
                    variant={selectedTime === time ? 'filled' : 'outlined'}
                    size="small"
                    sx={{ cursor: 'pointer', minWidth: 70 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Summary */}
          {selectedDate && selectedTime && !error && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Your order will be delivered on{' '}
              <strong>{formatDate(selectedDate)} at {selectedTime}</strong>
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ScheduledOrderPicker;
