import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Restaurant,
  ShoppingCart,
} from '@mui/icons-material';
import api from '../services/api';

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.overview?.totalUsers || 0,
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#E3F2FD',
    },
    {
      title: 'Total Restaurants',
      value: stats?.overview?.totalRestaurants || 0,
      icon: <Restaurant sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#E8F5E9',
    },
    {
      title: 'Total Orders',
      value: stats?.overview?.totalOrders || 0,
      icon: <ShoppingCart sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: '#FFF3E0',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.overview?.totalRevenue || 0).toFixed(2)}`,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />,
      color: '#E0F7FA',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
          Admin Analytics Dashboard
        </Typography>

        {/* Overview Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ bgcolor: stat.color }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                    {stat.icon}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Today's Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Today
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Orders
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stats?.today?.orders || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Revenue
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      ${(stats?.today?.revenue || 0).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  This Month
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Orders
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stats?.thisMonth?.orders || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Revenue
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      ${(stats?.thisMonth?.revenue || 0).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Orders */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Orders
            </Typography>
            {stats?.recentOrders?.length === 0 ? (
              <Typography color="text.secondary">No recent orders</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats?.recentOrders?.map((order: any) => (
                  <Box
                    key={order._id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.restaurant?.name} • {order.user?.firstName} {order.user?.lastName}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        ${order.totalAmount?.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          bgcolor:
                            order.status === 'delivered'
                              ? 'success.light'
                              : order.status === 'cancelled'
                              ? 'error.light'
                              : 'warning.light',
                          borderRadius: 1,
                        }}
                      >
                        {order.status}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AnalyticsDashboard;
