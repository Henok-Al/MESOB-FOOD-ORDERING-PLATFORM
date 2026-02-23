import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  TrendingUp,
  History,
} from '@mui/icons-material';
import api from '../services/api';

interface LoyaltyData {
  points: number;
  lifetimePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsToNextTier: number;
  nextTier: string | null;
  recentTransactions: Array<{
    type: 'earned' | 'redeemed' | 'bonus' | 'expired';
    points: number;
    description: string;
    createdAt: string;
  }>;
}

const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

const TIER_BENEFITS = {
  bronze: [
    'Earn 1 point per $1 spent',
    'Access to member-only promotions',
    'Birthday reward',
  ],
  silver: [
    'Earn 1.1 points per $1 spent (10% bonus)',
    'Free delivery on orders over $25',
    'Priority customer support',
  ],
  gold: [
    'Earn 1.25 points per $1 spent (25% bonus)',
    'Free delivery on all orders',
    'Exclusive restaurant access',
    'Double points on weekends',
  ],
  platinum: [
    'Earn 1.5 points per $1 spent (50% bonus)',
    'Free delivery + no service fees',
    'Dedicated support line',
    'Triple points on weekends',
    'Surprise rewards',
  ],
};

const LoyaltyDashboard: React.FC = () => {
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const response = await api.get('/loyalty');
      setLoyalty(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const getTierProgress = () => {
    if (!loyalty) return 0;
    const thresholds: Record<string, number> = {
      bronze: 0,
      silver: 500,
      gold: 1500,
      platinum: 5000,
    };
    const current = thresholds[loyalty.tier];
    const next = loyalty.nextTier ? thresholds[loyalty.nextTier] : 5000;
    const progress = ((loyalty.lifetimePoints - current) / (next - current)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Rewards Program
        </Typography>

        {/* Current Tier Card */}
        <Card sx={{ mb: 3, bgcolor: TIER_COLORS[loyalty?.tier || 'bronze'], color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <EmojiEvents sx={{ fontSize: 48 }} />
              <Box>
                <Typography variant="h3" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                  {loyalty?.tier} Tier
                </Typography>
                <Typography variant="subtitle1">
                  {loyalty?.points.toLocaleString()} Points Available
                </Typography>
              </Box>
            </Box>

            {loyalty?.nextTier && (
              <>
                <LinearProgress
                  variant="determinate"
                  value={getTierProgress()}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'white' },
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {loyalty.pointsToNextTier?.toLocaleString() || 0} points to {loyalty.nextTier}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Points Summary */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <Star sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                  Points Summary
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Available Points"
                      secondary={loyalty?.points.toLocaleString()}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Lifetime Points"
                      secondary={loyalty?.lifetimePoints.toLocaleString()}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Points Value"
                      secondary={`$${((loyalty?.points || 0) / 100).toFixed(2)}`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Tier Benefits */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
                  {(loyalty?.tier || 'bronze').charAt(0).toUpperCase() + (loyalty?.tier || 'bronze').slice(1)} Benefits
                </Typography>
                <List dense>
                  {TIER_BENEFITS[loyalty?.tier || 'bronze'].map((benefit, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`• ${benefit}`} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              <History sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Activity
            </Typography>
            {loyalty?.recentTransactions.length === 0 ? (
              <Typography color="text.secondary">No activity yet</Typography>
            ) : (
              <List>
                {loyalty?.recentTransactions.map((transaction, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={transaction.description}
                        secondary={new Date(transaction.createdAt).toLocaleDateString()}
                      />
                      <Chip
                        label={`${transaction.type === 'redeemed' ? '-' : '+'}${transaction.points}`}
                        color={
                          transaction.type === 'redeemed'
                            ? 'error'
                            : transaction.type === 'bonus'
                            ? 'success'
                            : 'primary'
                        }
                        size="small"
                      />
                    </ListItem>
                    {index < loyalty.recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoyaltyDashboard;
