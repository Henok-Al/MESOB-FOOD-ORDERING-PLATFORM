import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  AvatarGroup,
  Tooltip,
  IconButton,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  Stars,
  TrendingUp,
  CardGiftcard,
  EmojiEvents,
  ArrowUpward,
  ArrowDownward,
  InfoOutlined,
  Redeem,
  LocalOffer,
  WorkspacePremium,
  MilitaryTech,
  Diamond,
  Star,
  Leaderboard,
  History,
  Share,
  ContentCopy,
  Check,
} from '@mui/icons-material';
import {
  getLoyaltyAccount,
  redeemPoints,
  getTierBenefits,
  getLeaderboard,
  calculatePotentialPoints,
  calculateDiscountFromPoints,
  LoyaltyAccount,
  LoyaltyTransaction,
  TierBenefits,
  LeaderboardEntry,
} from '../services/loyaltyService';

interface LoyaltyDashboardProps {
  onPointsUpdate?: (points: number) => void;
}

const tierColors = {
  bronze: {
    primary: '#CD7F32',
    secondary: '#F5E6D3',
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
  },
  silver: {
    primary: '#C0C0C0',
    secondary: '#F5F5F5',
    gradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)',
  },
  gold: {
    primary: '#FFD700',
    secondary: '#FFF8DC',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  },
  platinum: {
    primary: '#E5E4E2',
    secondary: '#F0F0F0',
    gradient: 'linear-gradient(135deg, #00FFFF 0%, #008080 100%)',
  },
};

const tierIcons = {
  bronze: MilitaryTech,
  silver: Star,
  gold: EmojiEvents,
  platinum: Diamond,
};

const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({ onPointsUpdate }) => {
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [tierBenefits, setTierBenefits] = useState<TierBenefits | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Dialog states
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemPointsAmount, setRedeemPointsAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock referral code (would come from backend)
  const referralCode = `MESOB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const [loyaltyData, benefitsData, leaderboardData] = await Promise.all([
        getLoyaltyAccount(),
        getTierBenefits(),
        getLeaderboard(10),
      ]);

      setLoyalty(loyaltyData);
      setTierBenefits(benefitsData.benefits);
      setLeaderboard(leaderboardData);

      if (onPointsUpdate) {
        onPointsUpdate(loyaltyData.points);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemPoints = async () => {
    if (!redeemPointsAmount || parseInt(redeemPointsAmount) <= 0) return;

    try {
      setProcessing(true);
      const result = await redeemPoints(parseInt(redeemPointsAmount));

      setLoyalty((prev) =>
        prev
          ? {
              ...prev,
              points: result.currentPoints,
              recentTransactions: [
                {
                  type: 'redeemed',
                  points: result.pointsRedeemed,
                  description: result.message,
                  createdAt: new Date().toISOString(),
                },
                ...prev.recentTransactions,
              ],
            }
          : null
      );

      setRedeemOpen(false);
      setRedeemPointsAmount('');

      if (onPointsUpdate) {
        onPointsUpdate(result.currentPoints);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to redeem points');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <ArrowUpward color="success" />;
      case 'redeemed':
        return <ArrowDownward color="error" />;
      case 'bonus':
        return <CardGiftcard color="primary" />;
      case 'expired':
        return <TrendingUp color="warning" />;
      default:
        return <Stars color="action" />;
    }
  };

  const calculateProgress = () => {
    if (!loyalty || !tierBenefits) return 0;

    const thresholds = {
      bronze: 0,
      silver: 500,
      gold: 1500,
      platinum: 5000,
    };

    const currentThreshold = thresholds[loyalty.tier];
    const nextThreshold = loyalty.nextTier
      ? thresholds[loyalty.nextTier as keyof typeof thresholds]
      : thresholds.platinum;

    if (loyalty.tier === 'platinum') return 100;

    const progress = ((loyalty.lifetimePoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(progress, 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  const TierIcon = loyalty ? tierIcons[loyalty.tier] : Stars;

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loyalty Status Card */}
      <Card
        sx={{
          background: loyalty ? tierColors[loyalty.tier].gradient : tierColors.bronze.gradient,
          color: 'white',
          mb: 3,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            opacity: 0.1,
          }}
        >
          <TierIcon sx={{ fontSize: 200 }} />
        </Box>
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: 'white',
                    color: loyalty ? tierColors[loyalty.tier].primary : tierColors.bronze.primary,
                    width: 64,
                    height: 64,
                  }}
                >
                  <TierIcon sx={{ fontSize: 36 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" textTransform="capitalize">
                    {loyalty?.tier || 'Bronze'} Member
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {loyalty?.lifetimePoints.toLocaleString() || 0} Lifetime Points
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box textAlign={{ xs: 'left', md: 'right' }}>
                <Typography variant="h3" fontWeight="bold">
                  {loyalty?.points.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Available Points
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                  = ${(calculateDiscountFromPoints(loyalty?.points || 0)).toFixed(2)} in rewards
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Progress to next tier */}
          {loyalty && loyalty.tier !== 'platinum' && (
            <Box sx={{ mt: 3 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  {loyalty.pointsToNextTier} points to {loyalty.nextTier}
                </Typography>
                <Typography variant="body2">{Math.round(calculateProgress())}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={calculateProgress()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Redeem />}
            onClick={() => setRedeemOpen(true)}
            sx={{ py: 1.5 }}
          >
            Redeem Points
          </Button>
        </Grid>
        <Grid item xs={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Share />}
            onClick={handleCopyReferralCode}
            sx={{ py: 1.5 }}
          >
            {copied ? 'Copied!' : 'Refer Friends'}
          </Button>
        </Grid>
        <Grid item xs={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Leaderboard />}
            onClick={() => setActiveTab(2)}
            sx={{ py: 1.5 }}
          >
            Leaderboard
          </Button>
        </Grid>
        <Grid item xs={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<WorkspacePremium />}
            onClick={() => setActiveTab(1)}
            sx={{ py: 1.5 }}
          >
            View Benefits
          </Button>
        </Grid>
      </Grid>

      {/* Referral Code Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Your Referral Code
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share this code with friends. They get $10 off, you get 100 points!
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={referralCode}
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                }}
              />
              <IconButton onClick={handleCopyReferralCode}>
                {copied ? <Check color="success" /> : <ContentCopy />}
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Activity" icon={<History />} iconPosition="start" />
        <Tab label="Tier Benefits" icon={<WorkspacePremium />} iconPosition="start" />
        <Tab label="Leaderboard" icon={<Leaderboard />} iconPosition="start" />
      </Tabs>

      {/* Activity Tab */}
      {activeTab === 0 && (
        <Card>
          <List>
            {loyalty?.recentTransactions.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No activity yet"
                  secondary="Start earning points by placing orders!"
                  sx={{ textAlign: 'center', py: 4 }}
                />
              </ListItem>
            ) : (
              loyalty?.recentTransactions.map((transaction, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>{getTransactionIcon(transaction.type)}</ListItemIcon>
                    <ListItemText
                      primary={transaction.description}
                      secondary={new Date(transaction.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    />
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={
                        transaction.type === 'earned' || transaction.type === 'bonus'
                          ? 'success.main'
                          : 'error.main'
                      }
                    >
                      {transaction.type === 'earned' || transaction.type === 'bonus' ? '+' : '-'}
                      {transaction.points}
                    </Typography>
                  </ListItem>
                </React.Fragment>
              ))
            )}
          </List>
        </Card>
      )}

      {/* Tier Benefits Tab */}
      {activeTab === 1 && tierBenefits && (
        <Grid container spacing={2}>
          {Object.entries(tierBenefits).map(([tier, data]) => {
            const isCurrentTier = loyalty?.tier === tier;
            const TierIconComponent = tierIcons[tier as keyof typeof tierIcons];

            return (
              <Grid item xs={12} sm={6} md={3} key={tier}>
                <Card
                  sx={{
                    height: '100%',
                    border: isCurrentTier ? 2 : 0,
                    borderColor: tierColors[tier as keyof typeof tierColors].primary,
                    position: 'relative',
                  }}
                >
                  {isCurrentTier && (
                    <Chip
                      label="Current"
                      color="primary"
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    />
                  )}
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Avatar
                        sx={{
                          bgcolor: tierColors[tier as keyof typeof tierColors].primary,
                          color: 'white',
                        }}
                      >
                        <TierIconComponent />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" textTransform="capitalize">
                          {data.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {data.minPoints.toLocaleString()}+ points
                        </Typography>
                      </Box>
                    </Box>
                    <List dense>
                      {data.benefits.map((benefit: string, idx: number) => (
                        <ListItem key={idx} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <Check color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={benefit}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 2 && (
        <Card>
          <List>
            {leaderboard.map((entry, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor:
                          index === 0
                            ? '#FFD700'
                            : index === 1
                            ? '#C0C0C0'
                            : index === 2
                            ? '#CD7F32'
                            : 'grey.300',
                        color: index < 3 ? 'white' : 'text.primary',
                        fontWeight: 'bold',
                      }}
                    >
                      {index + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={`${entry.user.firstName} ${entry.user.lastName}`}
                    secondary={
                      <Chip
                        label={entry.tier}
                        size="small"
                        sx={{
                          textTransform: 'capitalize',
                          mt: 0.5,
                        }}
                      />
                    }
                  />
                  <Typography variant="body1" fontWeight="bold">
                    {entry.lifetimePoints.toLocaleString()} pts
                  </Typography>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}

      {/* Redeem Points Dialog */}
      <Dialog open={redeemOpen} onClose={() => setRedeemOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Redeem Points</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              100 points = $1.00 discount on your next order
            </Alert>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Available: {loyalty?.points.toLocaleString() || 0} points = $
              {calculateDiscountFromPoints(loyalty?.points || 0).toFixed(2)}
            </Typography>

            <TextField
              label="Points to Redeem"
              type="number"
              value={redeemPointsAmount}
              onChange={(e) => setRedeemPointsAmount(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={() => setRedeemPointsAmount(String(loyalty?.points || 0))}
                    >
                      Max
                    </Button>
                  </InputAdornment>
                ),
              }}
              helperText={
                redeemPointsAmount
                  ? `= $${calculateDiscountFromPoints(parseInt(redeemPointsAmount) || 0).toFixed(2)} discount`
                  : ''
              }
            />

            <Grid container spacing={1} sx={{ mt: 1 }}>
              {[100, 250, 500, 1000].map((amount) => (
                <Grid item xs={6} key={amount}>
                  <Button
                    variant={redeemPointsAmount === String(amount) ? 'contained' : 'outlined'}
                    fullWidth
                    onClick={() => setRedeemPointsAmount(String(amount))}
                    disabled={amount > (loyalty?.points || 0)}
                  >
                    {amount} pts (${calculateDiscountFromPoints(amount).toFixed(2)})
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRedeemOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRedeemPoints}
            disabled={
              !redeemPointsAmount ||
              parseInt(redeemPointsAmount) <= 0 ||
              parseInt(redeemPointsAmount) > (loyalty?.points || 0) ||
              processing
            }
          >
            {processing ? <CircularProgress size={24} /> : 'Redeem'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoyaltyDashboard;
