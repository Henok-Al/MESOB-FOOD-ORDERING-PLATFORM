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
  TextField,
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
} from '@mui/material';
import { CheckCircle, Cancel, Info } from '@mui/icons-material';
import api from '../services/api';

interface Restaurant {
  _id: string;
  name: string;
  owner: { name: string; email: string };
  cuisine: string;
  status: string;
  address: string;
  createdAt: string;
}

const RestaurantManagement: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, [page, search, statusFilter]);

  const fetchRestaurants = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/restaurants?${params.toString()}`);
      setRestaurants(response.data.data.restaurants);
      setTotalPages(response.data.pages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/restaurants/${id}/status`, {
        status,
        reason: status === 'rejected' ? rejectionReason : undefined,
      });
      fetchRestaurants();
      setOpenDialog(false);
      setRejectionReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
      approved: 'success',
      rejected: 'error',
      pending: 'warning',
      active: 'success',
      inactive: 'default',
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Restaurant Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or cuisine"
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Restaurants Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Cuisine</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {restaurants.map((restaurant) => (
              <TableRow key={restaurant._id}>
                <TableCell>{restaurant.name}</TableCell>
                <TableCell>
                  {restaurant.owner?.name}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {restaurant.owner?.email}
                  </Typography>
                </TableCell>
                <TableCell>{restaurant.cuisine}</TableCell>
                <TableCell>
                  <Chip
                    label={restaurant.status}
                    color={getStatusColor(restaurant.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(restaurant.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {restaurant.status === 'pending' && (
                    <>
                      <IconButton
                        color="success"
                        onClick={() => handleUpdateStatus(restaurant._id, 'approved')}
                      >
                        <CheckCircle />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setOpenDialog(true);
                        }}
                      >
                        <Cancel />
                      </IconButton>
                    </>
                  )}
                  <IconButton onClick={() => alert(`Address: ${restaurant.address}`)}>
                    <Info />
                  </IconButton>
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

      {/* Rejection Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Restaurant</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to reject {selectedRestaurant?.name}?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason (optional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() =>
              selectedRestaurant && handleUpdateStatus(selectedRestaurant._id, 'rejected')
            }
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RestaurantManagement;
