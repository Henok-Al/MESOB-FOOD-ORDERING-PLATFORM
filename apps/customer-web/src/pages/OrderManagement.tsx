import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Pagination,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import { Visibility, LocalShipping } from '@mui/icons-material';
import api from '../services/api';

interface Order {
  _id: string;
  orderNumber: string;
  user: { name: string; email: string };
  restaurant: { name: string };
  totalAmount: number;
  status: string;
  driver?: { name: string; phone: string };
  createdAt: string;
}

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready_for_pickup: 'primary',
  out_for_delivery: 'primary',
  delivered: 'success',
  cancelled: 'error',
};

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [drivers, setDrivers] = useState<Array<{ _id: string; name: string }>>([]);
  const [selectedDriver, setSelectedDriver] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/orders?${params.toString()}`);
      setOrders(response.data.data.orders);
      setTotalPages(response.data.pages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/admin/drivers?limit=100');
      setDrivers(response.data.data.drivers.map((d: any) => ({ _id: d._id, name: d.name })));
    } catch (err) {
      console.error('Failed to load drivers');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      await api.patch(`/admin/orders/${selectedOrder._id}/status`, { status: newStatus });
      fetchOrders();
      setOpenDialog(false);
      setSelectedOrder(null);
      setNewStatus('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedOrder || !selectedDriver) return;
    try {
      await api.patch(`/admin/orders/${selectedOrder._id}/assign-driver`, {
        driverId: selectedDriver,
      });
      fetchOrders();
      setOpenDialog(false);
      setSelectedOrder(null);
      setSelectedDriver('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign driver');
    }
  };

  const handleViewDetails = (order: Order) => {
    alert(`
      Order #${order.orderNumber}
      Customer: ${order.user.name} (${order.user.email})
      Restaurant: ${order.restaurant.name}
      Total: $${order.totalAmount.toFixed(2)}
      Status: ${order.status}
      Driver: ${order.driver?.name || 'Not assigned'}
      Created: ${new Date(order.createdAt).toLocaleString()}
    `);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Order Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="preparing">Preparing</MenuItem>
            <MenuItem value="ready_for_pickup">Ready for Pickup</MenuItem>
            <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Restaurant</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>
                  {order.user?.name}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {order.user?.email}
                  </Typography>
                </TableCell>
                <TableCell>{order.restaurant?.name}</TableCell>
                <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={statusColors[order.status] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {order.driver ? (
                    order.driver.name
                  ) : (
                    <Chip label="Not assigned" size="small" color="warning" />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewDetails(order)}>
                    <Visibility />
                  </IconButton>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedOrder(order);
                      setOpenDialog(true);
                    }}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
        />
      </Box>

      {/* Update Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order #{selectedOrder?.orderNumber}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="New Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="preparing">Preparing</MenuItem>
                  <MenuItem value="ready_for_pickup">Ready for Pickup</MenuItem>
                  <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Or Assign Driver:
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Driver</InputLabel>
                <Select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  label="Select Driver"
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver._id} value={driver._id}>
                      {driver.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {newStatus && (
            <Button variant="contained" onClick={handleUpdateStatus}>
              Update Status
            </Button>
          )}
          {selectedDriver && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAssignDriver}
              startIcon={<LocalShipping />}
            >
              Assign Driver
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderManagement;
