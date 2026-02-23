import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  History,
  CreditCard,
  Delete,
  Star,
  Edit,
  ArrowUpward,
  ArrowDownward,
  Autorenew,
  Payment,
  AccountBalance,
  Apple,
  Android,
  InfoOutlined,
  TrendingUp,
  Security,
} from '@mui/icons-material';
import {
  getWallet,
  addFunds,
  getTransactions,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  updateAutoRecharge,
  Wallet as WalletType,
  WalletTransaction,
  PaymentMethod,
} from '../services/walletService';

interface WalletDashboardProps {
  onWalletUpdate?: (balance: number) => void;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ onWalletUpdate }) => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Dialog states
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [addPaymentMethodOpen, setAddPaymentMethodOpen] = useState(false);
  const [autoRechargeOpen, setAutoRechargeOpen] = useState(false);

  // Form states
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);

  // Auto-recharge state
  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);
  const [autoRechargeThreshold, setAutoRechargeThreshold] = useState(20);
  const [autoRechargeAmount, setAutoRechargeAmount] = useState(50);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletData, transactionsData, methodsData] = await Promise.all([
        getWallet(),
        getTransactions({ limit: 10 }),
        getPaymentMethods(),
      ]);

      setWallet(walletData.wallet);
      setTransactions(transactionsData.transactions);
      setPaymentMethods(methodsData);

      if (walletData.wallet.autoRecharge) {
        setAutoRechargeEnabled(walletData.wallet.autoRecharge.enabled);
        setAutoRechargeThreshold(walletData.wallet.autoRecharge.threshold);
        setAutoRechargeAmount(walletData.wallet.autoRecharge.amount);
      }

      if (onWalletUpdate) {
        onWalletUpdate(walletData.wallet.balance);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) return;

    try {
      setProcessing(true);
      const result = await addFunds({
        amount: parseFloat(addFundsAmount),
        paymentMethodId: selectedPaymentMethod || undefined,
      });

      setWallet(result.wallet);
      setTransactions((prev) => [result.transaction, ...prev]);
      setAddFundsOpen(false);
      setAddFundsAmount('');

      if (onWalletUpdate) {
        onWalletUpdate(result.wallet.balance);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add funds');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await deletePaymentMethod(id);
      setPaymentMethods((prev) => prev.filter((pm) => pm._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      const updated = await setDefaultPaymentMethod(id);
      setPaymentMethods((prev) =>
        prev.map((pm) => ({
          ...pm,
          isDefault: pm._id === id,
        }))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set default payment method');
    }
  };

  const handleUpdateAutoRecharge = async () => {
    try {
      const updated = await updateAutoRecharge({
        enabled: autoRechargeEnabled,
        threshold: autoRechargeThreshold,
        amount: autoRechargeAmount,
        paymentMethod: selectedPaymentMethod,
      });
      setWallet(updated);
      setAutoRechargeOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update auto-recharge settings');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownward color="success" />;
      case 'debit':
        return <ArrowUpward color="error" />;
      case 'refund':
        return <Autorenew color="info" />;
      case 'cashback':
        return <TrendingUp color="success" />;
      default:
        return <History color="action" />;
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard />;
      case 'bank_account':
        return <AccountBalance />;
      case 'apple_pay':
        return <Apple />;
      case 'google_pay':
        return <Android />;
      case 'paypal':
        return <Payment />;
      default:
        return <CreditCard />;
    }
  };

  const getCardBrandColor = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
        return '#006FCF';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Wallet Balance Card */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #FF4B2B 0%, #FF6B4A 100%)',
          color: 'white',
          mb: 3,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Available Balance
              </Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                ${wallet?.balance.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                Daily Limit: ${wallet?.dailyLimit || 500} | Monthly Limit: ${wallet?.monthlyLimit || 5000}
              </Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddFundsOpen(true)}
                sx={{
                  bgcolor: 'white',
                  color: '#FF4B2B',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                }}
              >
                Add Funds
              </Button>
            </Box>
          </Box>

          {wallet?.autoRecharge?.enabled && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Autorenew fontSize="small" />
              <Typography variant="body2">
                Auto-recharge enabled: Add ${wallet.autoRecharge.amount} when balance falls below ${wallet.autoRecharge.threshold}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Transactions" icon={<History />} iconPosition="start" />
        <Tab label="Payment Methods" icon={<CreditCard />} iconPosition="start" />
        <Tab label="Settings" icon={<Security />} iconPosition="start" />
      </Tabs>

      {/* Transactions Tab */}
      {activeTab === 0 && (
        <Card>
          <List>
            {transactions.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No transactions yet"
                  secondary="Your transaction history will appear here"
                  sx={{ textAlign: 'center', py: 4 }}
                />
              </ListItem>
            ) : (
              transactions.map((transaction, index) => (
                <React.Fragment key={transaction._id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>{getTransactionIcon(transaction.type)}</ListItemIcon>
                    <ListItemText
                      primary={transaction.description}
                      secondary={new Date(transaction.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    />
                    <ListItemSecondaryAction>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color={transaction.type === 'credit' || transaction.type === 'refund' || transaction.type === 'cashback' ? 'success.main' : 'error.main'}
                      >
                        {transaction.type === 'credit' || transaction.type === 'refund' || transaction.type === 'cashback' ? '+' : '-'}$
                        {transaction.amount.toFixed(2)}
                      </Typography>
                      <Chip
                        label={transaction.status}
                        size="small"
                        color={transaction.status === 'completed' ? 'success' : 'default'}
                        sx={{ ml: 1 }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))
            )}
          </List>
        </Card>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 1 && (
        <Box>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setAddPaymentMethodOpen(true)}
            sx={{ mb: 2 }}
          >
            Add Payment Method
          </Button>

          <Grid container spacing={2}>
            {paymentMethods.map((method) => (
              <Grid item xs={12} sm={6} md={4} key={method._id}>
                <Card
                  sx={{
                    position: 'relative',
                    border: method.isDefault ? 2 : 1,
                    borderColor: method.isDefault ? 'primary.main' : 'divider',
                  }}
                >
                  {method.isDefault && (
                    <Chip
                      label="Default"
                      color="primary"
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    />
                  )}
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {getPaymentMethodIcon(method.type)}
                      <Typography variant="subtitle1">
                        {method.nickname || method.type.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Box>

                    {method.cardDetails && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          •••• {method.cardDetails.last4}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expires {method.cardDetails.expiryMonth}/{method.cardDetails.expiryYear}
                        </Typography>
                        <Chip
                          label={method.cardDetails.brand}
                          size="small"
                          sx={{
                            mt: 1,
                            bgcolor: getCardBrandColor(method.cardDetails.brand),
                            color: 'white',
                          }}
                        />
                      </Box>
                    )}

                    {method.bankDetails && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {method.bankDetails.bankName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •••• {method.bankDetails.accountNumberLast4} ({method.bankDetails.accountType})
                        </Typography>
                      </Box>
                    )}

                    {method.paypalEmail && (
                      <Typography variant="body2" color="text.secondary">
                        {method.paypalEmail}
                      </Typography>
                    )}

                    <Box display="flex" gap={1} mt={2}>
                      {!method.isDefault && (
                        <Button
                          size="small"
                          onClick={() => handleSetDefaultPaymentMethod(method._id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePaymentMethod(method._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {paymentMethods.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No payment methods added yet. Add a payment method to easily add funds to your wallet.
            </Alert>
          )}
        </Box>
      )}

      {/* Settings Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Auto-Recharge Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Automatically add funds to your wallet when the balance falls below a threshold.
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={autoRechargeEnabled}
                  onChange={(e) => setAutoRechargeEnabled(e.target.checked)}
                />
              }
              label="Enable Auto-Recharge"
            />

            {autoRechargeEnabled && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Threshold Amount"
                      type="number"
                      value={autoRechargeThreshold}
                      onChange={(e) => setAutoRechargeThreshold(Number(e.target.value))}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      helperText="Add funds when balance falls below this amount"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Recharge Amount"
                      type="number"
                      value={autoRechargeAmount}
                      onChange={(e) => setAutoRechargeAmount(Number(e.target.value))}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      helperText="Amount to add when threshold is reached"
                    />
                  </Grid>
                </Grid>

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    label="Payment Method"
                  >
                    {paymentMethods.map((method) => (
                      <MenuItem key={method._id} value={method._id}>
                        {method.nickname || method.type} {method.cardDetails && `•••• ${method.cardDetails.last4}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleUpdateAutoRecharge}
              sx={{ mt: 2 }}
            >
              Save Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Funds Dialog */}
      <Dialog open={addFundsOpen} onClose={() => setAddFundsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Funds to Wallet</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              {[10, 25, 50, 100].map((amount) => (
                <Grid item xs={6} key={amount}>
                  <Button
                    variant={addFundsAmount === String(amount) ? 'contained' : 'outlined'}
                    fullWidth
                    onClick={() => setAddFundsAmount(String(amount))}
                    sx={{ py: 2 }}
                  >
                    ${amount}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <TextField
              label="Custom Amount"
              type="number"
              value={addFundsAmount}
              onChange={(e) => setAddFundsAmount(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            {paymentMethods.length > 0 && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Payment Method (Optional)</InputLabel>
                <Select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  label="Payment Method (Optional)"
                >
                  <MenuItem value="">Use New Card</MenuItem>
                  {paymentMethods.map((method) => (
                    <MenuItem key={method._id} value={method._id}>
                      {method.nickname || method.type} {method.cardDetails && `•••• ${method.cardDetails.last4}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Funds will be available immediately after successful payment.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFundsOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddFunds}
            disabled={!addFundsAmount || parseFloat(addFundsAmount) <= 0 || processing}
          >
            {processing ? <CircularProgress size={24} /> : `Add $${addFundsAmount || '0'}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Payment Method Dialog */}
      <Dialog open={addPaymentMethodOpen} onClose={() => setAddPaymentMethodOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Payment methods are securely stored with Stripe. We never store your full card details.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This feature requires Stripe integration. In production, you would see a secure payment form here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPaymentMethodOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddPaymentMethodOpen(false)}>
            Add Card
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletDashboard;
