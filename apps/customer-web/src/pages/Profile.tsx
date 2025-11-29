import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import api from '../services/api';
import AddressForm from '../components/AddressForm';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addresses: Array<{
        _id: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        isDefault: boolean;
    }>;
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);

    // Form state for profile update
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile/me');
            const userData = response.data.data.user;
            setProfile(userData);
            setEditForm({
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone || '',
            });
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.put('/profile/me', editForm);
            setSuccess('Profile updated successfully');
            setIsEditing(false);
            fetchProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleAddAddress = async (addressData: any) => {
        try {
            await api.post('/profile/addresses', addressData);
            setShowAddressForm(false);
            fetchProfile();
            setSuccess('Address added successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add address');
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await api.delete(`/profile/addresses/${id}`);
            fetchProfile();
            setSuccess('Address deleted successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete address');
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                My Profile
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={4}>
                {/* Personal Information */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight="bold">Personal Information</Typography>
                            {!isEditing && (
                                <Button onClick={() => setIsEditing(true)}>Edit</Button>
                            )}
                        </Box>

                        {isEditing ? (
                            <Box component="form" onSubmit={handleUpdateProfile}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="First Name"
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Phone"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button type="submit" variant="contained">Save Changes</Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography color="text.secondary">Full Name</Typography>
                                    <Typography variant="body1">{profile?.firstName} {profile?.lastName}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography color="text.secondary">Email</Typography>
                                    <Typography variant="body1">{profile?.email}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography color="text.secondary">Phone</Typography>
                                    <Typography variant="body1">{profile?.phone || 'Not set'}</Typography>
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Grid>

                {/* Address Book */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight="bold">Address Book</Typography>
                            {!showAddressForm && (
                                <Button startIcon={<AddIcon />} onClick={() => setShowAddressForm(true)}>
                                    Add New
                                </Button>
                            )}
                        </Box>

                        {showAddressForm ? (
                            <AddressForm
                                onSubmit={handleAddAddress}
                                onCancel={() => setShowAddressForm(false)}
                            />
                        ) : (
                            <List>
                                {profile?.addresses && profile.addresses.length > 0 ? (
                                    profile.addresses.map((address, index) => (
                                        <React.Fragment key={address._id}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={`${address.street}`}
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2" color="text.primary">
                                                                {address.city}, {address.state} {address.zipCode}
                                                            </Typography>
                                                            {address.isDefault && (
                                                                <Box component="span" sx={{ ml: 1, bgcolor: 'primary.main', color: 'white', px: 1, borderRadius: 1, fontSize: '0.75rem' }}>
                                                                    Default
                                                                </Box>
                                                            )}
                                                        </>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAddress(address._id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            {index < profile.addresses.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <Typography color="text.secondary" align="center">
                                        No addresses saved yet.
                                    </Typography>
                                )}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;
