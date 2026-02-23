import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Grid,
  Radio,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { Add, Delete, Edit, LocationOn } from '@mui/icons-material';
import api from '../services/api';

interface Address {
  _id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  deliveryInstructions?: string;
  contactName?: string;
  contactPhone?: string;
}

interface AddressManagerProps {
  selectedAddressId?: string;
  onSelectAddress?: (address: Address) => void;
  showSelection?: boolean;
}

const AddressManager: React.FC<AddressManagerProps> = ({
  selectedAddressId,
  onSelectAddress,
  showSelection = false,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
    deliveryInstructions: '',
    contactName: '',
    contactPhone: '',
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data.data.addresses);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        name: address.name,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        isDefault: address.isDefault,
        deliveryInstructions: address.deliveryInstructions || '',
        contactName: address.contactName || '',
        contactPhone: address.contactPhone || '',
      });
    } else {
      setEditingAddress(null);
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false,
        deliveryInstructions: '',
        contactName: '',
        contactPhone: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAddress(null);
  };

  const handleSave = async () => {
    try {
      if (editingAddress) {
        await api.patch(`/addresses/${editingAddress._id}`, formData);
      } else {
        await api.post('/addresses', formData);
      }
      fetchAddresses();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      fetchAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/addresses/${id}/set-default`);
      fetchAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set default address');
    }
  };

  if (loading) {
    return <Typography>Loading addresses...</Typography>;
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Saved Addresses
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Address
        </Button>
      </Box>

      <Grid container spacing={2}>
        {addresses.map((address) => (
          <Grid item xs={12} md={6} key={address._id}>
            <Card
              variant={selectedAddressId === address._id ? 'elevation' : 'outlined'}
              elevation={selectedAddressId === address._id ? 4 : 1}
              sx={{
                cursor: showSelection ? 'pointer' : 'default',
                border: selectedAddressId === address._id ? '2px solid primary.main' : undefined,
              }}
              onClick={() => showSelection && onSelectAddress?.(address)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <LocationOn color={address.isDefault ? 'primary' : 'action'} />
                    <Box>
                      <Typography fontWeight="bold">
                        {address.name}
                        {address.isDefault && (
                          <Typography component="span" color="primary" sx={{ ml: 1, fontSize: '0.75rem' }}>
                            (Default)
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {address.street}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {address.city}, {address.state} {address.zipCode}
                      </Typography>
                      {address.deliveryInstructions && (
                        <Typography variant="caption" color="text.secondary">
                          Instructions: {address.deliveryInstructions}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(address)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(address._id)} size="small" color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {!address.isDefault && (
                  <Button
                    size="small"
                    onClick={() => handleSetDefault(address._id)}
                    sx={{ mt: 1 }}
                  >
                    Set as Default
                  </Button>
                )}

                {showSelection && selectedAddressId !== address._id && (
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={() => onSelectAddress?.(address)}
                  >
                    Select This Address
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {addresses.length === 0 && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No saved addresses yet. Add your first address!
        </Typography>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Name (e.g., Home, Work)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Delivery Instructions (optional)"
                value={formData.deliveryInstructions}
                onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                placeholder="e.g., Ring doorbell, Leave at front door, Call upon arrival"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Radio
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                }
                label="Set as default address"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save Address
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddressManager;
