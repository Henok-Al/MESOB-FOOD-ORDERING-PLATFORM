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
import { Search } from '@mui/icons-material';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [cuisineFilter, setCuisineFilter] = useState('');

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

    const filteredRestaurants = restaurants.filter(restaurant => {
        const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCuisine = cuisineFilter ? restaurant.cuisine.toLowerCase().includes(cuisineFilter.toLowerCase()) : true;
        return matchesSearch && matchesCuisine;
    });

    const uniqueCuisines = Array.from(new Set(restaurants.map(r => r.cuisine)));

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
                                <Button variant="text" onClick={() => navigate('/profile')}>
                                    Hi, {user?.firstName}
                                </Button>
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
                            <IconButton sx={{ p: '10px' }} aria-label="search">
                                <Search color="primary" />
                            </IconButton>
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Search restaurants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Paper>

                        {/* Cuisine Filter Chips */}
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                                variant={cuisineFilter === '' ? "contained" : "outlined"}
                                onClick={() => setCuisineFilter('')}
                                size="small"
                                sx={{ borderRadius: 20 }}
                            >
                                All
                            </Button>
                            {uniqueCuisines.map(cuisine => (
                                <Button
                                    key={cuisine}
                                    variant={cuisineFilter === cuisine ? "contained" : "outlined"}
                                    onClick={() => setCuisineFilter(cuisine)}
                                    size="small"
                                    sx={{ borderRadius: 20 }}
                                >
                                    {cuisine}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Restaurant Listing */}
            <Container maxWidth="xl" sx={{ py: 6 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                    {searchTerm || cuisineFilter ? 'Search Results' : 'Popular Restaurants'}
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {filteredRestaurants.length > 0 ? (
                            filteredRestaurants.map((restaurant) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={restaurant._id || restaurant.id}>
                                    <RestaurantCard restaurant={restaurant} />
                                </Grid>
                            ))
                        ) : (
                            <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No restaurants found matching your criteria.
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default Home;
