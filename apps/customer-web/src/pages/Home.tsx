import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Paper,
    InputBase,
    IconButton,
    CircularProgress,
} from '@mui/material';
import { Search, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import api from '../services/api';
import RestaurantCard from '../components/common/RestaurantCard';
import { Restaurant } from '@food-ordering/types';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await api.get('/restaurants');
                setRestaurants(response.data.data.restaurants);
            } catch (error) {
                console.error('Failed to fetch restaurants:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA' }}>
            {/* Header / Hero Section */}
            <Box sx={{ bgcolor: 'white', pb: 4, pt: 2, px: { xs: 2, md: 4 } }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            Mesob
                        </Typography>
                        {isAuthenticated ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography fontWeight="500">Hi, {user?.firstName}</Typography>
                                <Button variant="outlined" color="inherit" onClick={handleLogout} size="small">
                                    Logout
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="text" onClick={() => navigate('/login')}>Login</Button>
                                <Button variant="contained" onClick={() => navigate('/register')}>Sign Up</Button>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h2" gutterBottom sx={{ fontWeight: 800 }}>
                            Delicious Food, <br />
                            <Box component="span" color="primary.main">Delivered To You</Box>
                        </Typography>

                        <Paper
                            component="form"
                            sx={{
                                p: '2px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: 600,
                                mx: 'auto',
                                mt: 4,
                                borderRadius: '50px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            }}
                        >
                            <IconButton sx={{ p: '10px' }} aria-label="location">
                                <LocationOn color="primary" />
                            </IconButton>
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Enter your delivery address"
                                inputProps={{ 'aria-label': 'search google maps' }}
                            />
                            <Button
                                variant="contained"
                                sx={{ borderRadius: '50px', px: 4, py: 1.5, m: 0.5 }}
                            >
                                Search
                            </Button>
                        </Paper>
                    </Box>
                </Container>
            </Box>

            {/* Restaurant Listing */}
            <Container maxWidth="xl" sx={{ py: 6 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                    Popular Restaurants
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {restaurants.map((restaurant) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={restaurant._id || restaurant.id}>
                                <RestaurantCard restaurant={restaurant} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default Home;
