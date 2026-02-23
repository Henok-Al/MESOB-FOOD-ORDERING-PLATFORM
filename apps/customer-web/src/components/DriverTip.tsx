import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
} from '@mui/material';
import { LocalAtm, ThumbUp } from '@mui/icons-material';
import api from '../services/api';

interface DriverTipProps {
  orderId: string;
  currentTip?: number;
  onTipAdded: (amount: number) => void;
}

const tipAmounts = [2, 3, 5, 10];

const DriverTip: React.FC<DriverTipProps> = ({
  orderId,
  currentTip = 0,
  onTipAdded,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedAmount(null);
    setCustomAmount('');
    setError('');
  };

  const handleAmountSelect = (
    _: React.MouseEvent<HTMLElement>,
    newAmount: number | null
  ) => {
    setSelectedAmount(newAmount);
    if (newAmount) {
      setCustomAmount('');
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const getTipAmount = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseFloat(customAmount);
    return 0;
  };

  const handleSubmitTip = async () => {
    const amount = getTipAmount();
    if (amount <= 0) {
      setError('Please select or enter a tip amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/orders/${orderId}/tip`, {
        amount,
        paymentMethod: 'card',
      });
      setSuccess(`Thank you for tipping $${amount.toFixed(2)}!`);
      onTipAdded(amount);
      setTimeout(() => {
        handleClose();
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add tip');
    } finally {
      setLoading(false);
    }
  };

  if (currentTip > 0) {
    return (
      <Chip
        icon={<ThumbUp />}
        label={`Tip: $${currentTip.toFixed(2)}`}
        color="success"
        variant="outlined"
      />
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Want to tip your driver?
        </Typography>
        <Button
          size="small"
          startIcon={<LocalAtm />}
          variant="outlined"
          onClick={handleOpen}
        >
          Add Tip
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Tip Your Driver</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Show appreciation for your delivery driver's hard work!
          </Typography>

          <ToggleButtonGroup
            value={selectedAmount}
            exclusive
            onChange={handleAmountSelect}
            fullWidth
            sx={{ mb: 2 }}
          >
            {tipAmounts.map((amount) => (
              <ToggleButton key={amount} value={amount}>
                ${amount}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Or enter custom amount:
          </Typography>

          <TextField
            fullWidth
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={handleCustomAmountChange}
            InputProps={{
              startAdornment: '$',
            }}
          />

          {getTipAmount() > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="h6" fontWeight="bold" color="success.dark">
                Total Tip: ${getTipAmount().toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmitTip}
            variant="contained"
            disabled={loading || getTipAmount() <= 0}
          >
            {loading ? 'Adding...' : 'Add Tip'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DriverTip;
