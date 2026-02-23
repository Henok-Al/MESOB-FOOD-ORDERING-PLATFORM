import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  People,
  Restaurant,
  ShoppingCart,
  AttachMoney,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface DashboardStats {
  users: {
    total: number;
    newToday: number;
    newThisWeek: number;
  };
  restaurants: {
    total: number;
    pending: number;
  };
  orders: {
    total: number;
    today: number;
    thisWeek: number;
    byStatus: {
      pending: number;
      preparing: number;
      delivering: number;
      delivered: number;
      cancelled: number;
    };
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    user: { name: string };
    restaurant: { name: string };
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users.total || 0,
      subtext: `+${stats?.users.newToday || 0} today`,
      icon: <People sx={{ fontSize: 40, color: '#2196F3' }} />,
      path: '/admin/users',
      color: '#2196F3',
    },
    {
      title: 'Restaurants',
      value: stats?.restaurants.total || 0,
      subtext: `${stats?.restaurants.pending || 0} pending approval`,
      icon: <Restaurant sx={{ fontSize: 40, color: '#FF9800' }} />,
      path: '/admin/restaurants',
      color: '#FF9800',
    },
    {
      title: 'Total Orders',
      value: stats?.orders.total || 0,
      subtext: `${stats?.orders.today || 0} today`,
      icon: <ShoppingCart sx={{ fontSize: 40, color: '#4CAF50' }} />,
      path: '/admin/orders',
      color: '#4CAF50',
    },
    {
      title: 'Revenue',
      value: `$${stats?.revenue.thisMonth.toFixed(2) || '0.00'}`,
      subtext: 'This month',
      icon: <AttachMoney sx={{ fontSize: 40, color: '#9C27B0' }} />,
      path: '/admin/analytics',
      color: '#9C27B0',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      pending: 'warning',
      preparing: 'info',
      delivering: 'primary',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
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
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <CardActionArea onClick={() => navigate(card.path)}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {card.icon}
                      <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: card.color }}>
                          {card.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {card.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {card.subtext}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </CardActionArea>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Order Status Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Orders by Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Pending"
                      secondary={stats?.orders.byStatus.pending || 0}
                    />
                    <Chip label="Pending" color="warning" size="small" />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Preparing"
                      secondary={stats?.orders.byStatus.preparing || 0}
                    />
                    <Chip label="Preparing" color="info" size="small" />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Out for Delivery"
                      secondary={stats?.orders.byStatus.delivering || 0}
                    />
                    <Chip label="Delivering" color="primary" size="small" />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Delivered"
                      secondary={stats?.orders.byStatus.delivered || 0}
                    />
                    <Chip label="Delivered" color="success" size="small" />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Cancelled"
                      secondary={stats?.orders.byStatus.cancelled || 0}
                    />
                    <Chip label="Cancelled" color="error" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Orders
                </Typography>
                {stats?.recentOrders.length === 0 ? (
                  <Typography color="text.secondary">No recent orders</Typography>
                ) : (
                  <List>
                    {stats?.recentOrders.map((order, index) => (
                      <React.Fragment key={order._id}>
                        <ListItem>
                          <ListItemText
                            primary={`Order #${order.orderNumber}`}
                            secondary={`${order.user?.name} - ${order.restaurant?.name} - $${order.totalAmount.toFixed(2)}`}
                          />
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </ListItem>
                        {index < (stats?.recentOrders.length || 0) - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard; 
