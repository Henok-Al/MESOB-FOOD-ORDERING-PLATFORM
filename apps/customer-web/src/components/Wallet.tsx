import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Skeleton,
  IconButton,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  CreditCard,
  AccountBalance,
  Delete,
  Star,
  History,
  Payment,
} from '@mui/icons-material';
import api from '../services/api';

interface WalletData {
  wallet: {
    balance: number;
    currency: string;
    autoRecharge: {
      enabled: boolean;
      threshold: number;
      amount: number;
    };
  };
  recentTransactions: Array<{
    _id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
    status: string;
  }>;
}

interface PaymentMethod {
  _id: string;
  type: string;
  nickname?: string;
  isDefault: boolean;
  cardDetails?: {
    last4: string;
    brand: string;
    expiryMonth: string;
    expiryYear: string;
  };
  bankDetails?: {
    accountNumberLast4: string;
    bankName: string;
  };
}

const WalletComponent: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'methods'>('overview');

  useEffect(() => {
    fetchWalletData();
    fetchPaymentMethods();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await api.get('/wallet');
      setWalletData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('/wallet/payment-methods');
      setPaymentMethods(response.data.data.paymentMethods);
    } catch (err) {
      console.error('Failed to load payment methods');
    }
  };

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await api.post('/wallet/add-funds', {
        amount: parseFloat(amount),
      });
      setAddFundsOpen(false);
      setAmount('');
      fetchWalletData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add funds');
    }
  };

  const getTransactionColor = (type: string) => {
    const colors: Record<string, 'success' | 'error' | 'info' | 'default'> = {
      credit: 'success',
      debit: 'error',
      refund: 'info',
      cashback: 'success',
    };
    return colors[type] || 'default';
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard />;
      case 'bank_account':
        return <AccountBalance />;
      default:
        return <Payment />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        <AccountBalanceWallet sx={{ mr: 1, verticalAlign: 'middle' }} />
        My Wallet
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Navigation Tabs */}
      <ToggleButtonGroup
        value={activeTab}
        exclusive
        onChange={(_, value) => value && setActiveTab(value)}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="overview">
          <AccountBalanceWallet sx={{ mr: 1 }} />
          Overview
        </ToggleButton>
        <ToggleButton value="transactions">
          <History sx={{ mr: 1 }} />
          Transactions
        </ToggleButton>
        <ToggleButton value="methods">
          <CreditCard sx={{ mr: 1 }} />
          Payment Methods
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Overview Tab */}
      {activeTab === 'overview' && walletData && (
        <Box>
          {/* Balance Card */}
          <Paper
            sx={{
              p: 4,
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              Available Balance
            </Typography>
            <Typography variant="h2" fontWeight="bold" sx={{ my: 2 }}>
              ${walletData.wallet.balance.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {walletData.wallet.currency}
            </Typography>
            <Button
              variant="contained"
              sx={{
                mt: 2,
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
              }}
              startIcon={<Add />}
              onClick={() => setAddFundsOpen(true)}
            >
              Add Funds
            </Button>
          </Paper>

          {/* Auto-recharge Settings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Auto-Recharge Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Automatically add funds when your balance runs low
              </Typography>
              <Chip
                label={walletData.wallet.autoRecharge.enabled ? 'Enabled' : 'Disabled'}
                color={walletData.wallet.autoRecharge.enabled ? 'success' : 'default'}
                sx={{ mt: 1 }}
              />
              {walletData.wallet.autoRecharge.enabled && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  When balance drops below ${walletData.wallet.autoRecharge.threshold},
                  add ${walletData.wallet.autoRecharge.amount} automatically
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Paper>
            <List>
              {walletData.recentTransactions.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No recent transactions" />
                </ListItem>
              ) : (
                walletData.recentTransactions.map((tx, index) => (
                  <React.Fragment key={tx._id}>
                    <ListItem>
                      <ListItemText
                        primary={tx.description}
                        secondary={new Date(tx.createdAt).toLocaleDateString()}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color={tx.type === 'debit' ? 'error' : 'success'}
                        >
                          {tx.type === 'debit' ? '-' : '+'}${tx.amount.toFixed(2)}
                        </Typography>
                        <Chip
                          label={tx.type}
                          size="small"
                          color={getTransactionColor(tx.type)}
                          variant="outlined"
                        />
                      </Box>
                    </ListItem>
                    {index < walletData.recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Box>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Transaction History
          </Typography>
          <List>
            {walletData?.recentTransactions.map((tx) => (
              <ListItem key={tx._id}>
                <ListItemText
                  primary={tx.description}
                  secondary={new Date(tx.createdAt).toLocaleString()}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color={tx.type === 'debit' ? 'error' : 'success'}
                >
                  {tx.type === 'debit' ? '-' : '+'}${tx.amount.toFixed(2)}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'methods' && (
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddCardOpen(true)}
            sx={{ mb: 2 }}
          >
            Add Payment Method
          </Button>

          <Grid container spacing={2}>
            {paymentMethods.map((method) => (
              <Grid item xs={12} md={6} key={method._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getPaymentMethodIcon(method.type)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">
                          {method.nickname ||
                            (method.cardDetails
                              ? `${method.cardDetails.brand} ****${method.cardDetails.last4}`
                              : method.bankDetails?.bankName)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {method.type === 'card' && method.cardDetails &&
                            `Expires ${method.cardDetails.expiryMonth}/${method.cardDetails.expiryYear}`}
                        </Typography>
                      </Box>
                      {method.isDefault && (
                        <Chip
                          icon={<Star />}
                          label="Default"
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={async () => {
                        try {
                          await api.delete(`/wallet/payment-methods/${method._id}`);
                          fetchPaymentMethods();
                        } catch (err) {
                          console.error('Failed to delete payment method');
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {paymentMethods.length === 0 && (
            <Alert severity="info">No payment methods added yet</Alert>
          )}
        </Box>
      )}

      {/* Add Funds Dialog */}
      <Dialog open={addFundsOpen} onClose={() => setAddFundsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Funds to Wallet</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            InputProps={{ startAdornment: '$' }}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Amounts
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[10, 25, 50, 100].map((quickAmount) => (
                <Chip
                  key={quickAmount}
                  label={`$${quickAmount}`}
                  onClick={() => setAmount(quickAmount.toString())}
                  clickable
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFundsOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddFunds}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Add Funds
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WalletComponent;
