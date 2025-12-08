import React, { useState, useEffect, useRef } from 'react';
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
    Avatar,
    Chip,
    Stack,
    Tooltip,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    PhotoCamera as PhotoCameraIcon,
    CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import api from '../services/api';
import AddressForm from '../components/AddressForm';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage?: string;
    createdAt?: string;
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
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state for profile update
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        profileImage: '',
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
                profileImage: userData.profileImage || '',
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

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError('');
        setSuccess('');
        setAvatarUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const imageUrl = response.data.data.url;
            await api.put('/profile/me', { profileImage: imageUrl });

            setProfile(prev => (prev ? { ...prev, profileImage: imageUrl } : prev));
            setEditForm(prev => ({ ...prev, profileImage: imageUrl }));
            setSuccess('Profile photo updated successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload profile photo');
        } finally {
            setAvatarUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveAvatar = async () => {
        if (!profile?.profileImage) return;

        setError('');
        setSuccess('');
        setAvatarUploading(true);

        try {
            await api.put('/profile/me', { profileImage: '' });
            setProfile(prev => (prev ? { ...prev, profileImage: '' } : prev));
            setEditForm(prev => ({ ...prev, profileImage: '' }));
            setSuccess('Profile photo removed');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to remove profile photo');
        } finally {
            setAvatarUploading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
        : null;
    const addressesCount = profile?.addresses?.length ?? 0;
    const hasAddresses = addressesCount > 0;

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                My Profile
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
            />

            <Paper
                sx={{
                    p: { xs: 3, md: 4 },
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: '0px 20px 45px rgba(15,23,42,0.08)',
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md="auto">
                        <Box sx={{ position: 'relative', width: 140, height: 140 }}>
                            <Avatar
                                src={profile?.profileImage}
                                alt={`${profile?.firstName} ${profile?.lastName}`}
                                sx={{ width: '100%', height: '100%', fontSize: 48 }}
                            >
                                {profile?.firstName?.[0]}
                            </Avatar>
                            {avatarUploading && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'rgba(0,0,0,0.45)',
                                        borderRadius: '50%',
                                    }}
                                >
                                    <CircularProgress size={32} thickness={4} />
                                </Box>
                            )}
                            <Tooltip title="Upload new photo">
                                <span>
                                    <IconButton
                                        color="primary"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 8,
                                            right: 8,
                                            bgcolor: 'background.paper',
                                            boxShadow: 2,
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={avatarUploading}
                                    >
                                        <PhotoCameraIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            {profile?.firstName} {profile?.lastName}
                        </Typography>
                        <Typography color="text.secondary">{profile?.email}</Typography>
                        <Typography color="text.secondary">{profile?.phone || 'Phone not set'}</Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
                            {memberSince && <Chip label={`Member since ${memberSince}`} color="primary" size="small" />}
                            <Chip label={`${addressesCount} saved addresses`} size="small" variant="outlined" />
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={avatarUploading}
                            >
                                {avatarUploading ? 'Uploading...' : 'Upload new photo'}
                            </Button>
                            {profile?.profileImage && (
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={handleRemoveAvatar}
                                    disabled={avatarUploading}
                                >
                                    Remove photo
                                </Button>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Personal Information</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Manage how your basic information appears across the platform.
                                </Typography>
                            </Box>
                            {!isEditing && (
                                <Button variant="outlined" onClick={() => setIsEditing(true)}>Edit</Button>
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

                <Grid item xs={12}>
                    <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Address Book</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Save delivery locations for faster checkout.
                                </Typography>
                            </Box>
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
                                {hasAddresses ? (
                                    profile?.addresses?.map((address, index) => (
                                        <React.Fragment key={address._id}>
                                            <ListItem alignItems="flex-start">
                                                <ListItemText
                                                    primary={address.street}
                                                    secondary={
                                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                            <Typography component="span" variant="body2" color="text.primary">
                                                                {address.city}, {address.state} {address.zipCode}
                                                            </Typography>
                                                            {address.isDefault && (
                                                                <Chip label="Default" size="small" color="primary" />
                                                            )}
                                                        </Stack>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAddress(address._id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            {index < addressesCount - 1 && <Divider component="li" sx={{ ml: 7 }} />}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <Box sx={{ py: 6, textAlign: 'center' }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            No addresses saved yet
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Add your first delivery location to speed up checkout.
                                        </Typography>
                                        <Button variant="contained" onClick={() => setShowAddressForm(true)}>
                                            Add Address
                                        </Button>
                                    </Box>
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
