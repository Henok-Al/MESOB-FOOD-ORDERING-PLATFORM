import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Button,
    Paper,
    Divider,
    CircularProgress,
    Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, AccessTime, DeliveryDining } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { RootState } from '../store';
import { clearCart } from '../store/slices/cartSlice';
import { Restaurant, Product } from '@food-ordering/types';

const RestaurantDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const cart = useSelector((state: RootState) => state.cart);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, we'd have a specific endpoint for getting a single restaurant
                // For now, we'll fetch all and filter (not efficient but works for MVP)
                // Or better, let's assume we can get it from the list if we had state management for restaurants
                // But since we don't, let's just fetch products which is our main goal here

                // Fetch products for this restaurant
                const productsResponse = await api.get(`/restaurants/${id}/products`);
                setProducts(productsResponse.data.data.products);

                // Fetch restaurant details (mocking it by fetching all and finding one for now as we didn't make a single rest endpoint)
                // Ideally: await api.get(`/restaurants/${id}`)
                const restResponse = await api.get('/restaurants');
                const found = restResponse.data.data.restaurants.find((r: any) => r._id === id || r.id === id);
                if (found) setRestaurant(found);

            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!restaurant) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h5">Restaurant not found</Typography>
                <Button onClick={() => navigate('/')}>Back to Home</Button>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA', pb: 8 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    height: 300,
                    backgroundImage: `url(${restaurant.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))',
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ height: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', pb: 4 }}>
                    <Box sx={{ color: 'white' }}>
                        <Typography variant="h2" fontWeight="bold" gutterBottom>
                            {restaurant.name}
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                            {restaurant.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <Chip
                                icon={<Star sx={{ color: '#FFD700 !important' }} />}
                                label={restaurant.rating}
                                sx={{ bgcolor: 'white', fontWeight: 'bold' }}
                            />
                            <Chip
                                icon={<AccessTime sx={{ color: 'white' }} />}
                                label={restaurant.deliveryTime}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}
                            />
                            <Chip
                                icon={<DeliveryDining sx={{ color: 'white' }} />}
                                label={`Min Order $${restaurant.minOrder}`}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={4}>
                    {/* Menu Section */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                            Menu
                        </Typography>

                        {products.length === 0 ? (
                            <Typography color="text.secondary">No items available yet.</Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {products.map((product) => (
                                    <Grid item xs={12} key={product._id}>
                                        <ProductCard product={product} restaurantId={restaurant._id || ''} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>

                    {/* Cart Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 24, borderRadius: 3 }}>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Your Order
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            {cart.items.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="text.secondary" gutterBottom>
                                        Your cart is empty
                                    </Typography>
                                    <Typography variant="body2" color="text.disabled">
                                        Add items from the menu to start your order
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    {cart.items.map((item) => (
                                        <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Typography fontWeight="bold" color="primary">
                                                    {item.quantity}x
                                                </Typography>
                                                <Typography>
                                                    {item.name}
                                                </Typography>
                                            </Box>
                                            <Typography fontWeight="bold">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    ))}

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                        <Typography variant="h6" fontWeight="bold">Total</Typography>
                                        <Typography variant="h6" fontWeight="bold" color="primary">
                                            ${cart.total.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        sx={{ mb: 2 }}
                                        onClick={() => navigate('/checkout')}
                                    >
                                        Checkout
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        color="error"
                                        onClick={() => dispatch(clearCart())}
                                    >
                                        Clear Cart
                                    </Button>
                                </>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default RestaurantDetails;
