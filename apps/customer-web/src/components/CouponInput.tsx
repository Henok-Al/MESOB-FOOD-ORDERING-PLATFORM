import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { LocalOffer, CheckCircle } from '@mui/icons-material';
import api from '../services/api';

interface CouponInputProps {
  orderAmount: number;
  restaurantId: string;
  onCouponApplied: (discount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: { code: string; discount: number } | null;
}

const CouponInput: React.FC<CouponInputProps> = ({
  orderAmount,
  restaurantId,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateCoupon = async () => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/coupons/validate', {
        code,
        orderAmount,
        restaurantId,
      });

      const { discount, code: validatedCode } = response.data.data.coupon;
      setSuccess(`Coupon applied! You saved $${discount.toFixed(2)}`);
      onCouponApplied(discount, validatedCode);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setCode('');
    setSuccess('');
    setError('');
    onCouponRemoved();
  };

  if (appliedCoupon) {
    return (
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.light' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="success" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              Coupon Applied: {appliedCoupon.code}
            </Typography>
            <Typography variant="body2" color="success.dark">
              You saved ${appliedCoupon.discount.toFixed(2)}
            </Typography>
          </Box>
          <Button size="small" onClick={removeCoupon} color="inherit">
            Remove
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocalOffer color="primary" />
        <Typography variant="h6" fontWeight="bold">
          Apply Coupon
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={validateCoupon}
          disabled={loading || !code.trim()}
        >
          Apply
        </Button>
      </Box>
    </Paper>
  );
};

export default CouponInput;
