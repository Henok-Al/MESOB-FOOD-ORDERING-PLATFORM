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
    Avatar,
    Rating,
    Pagination,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, AccessTime, DeliveryDining } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { RootState } from '../store';
import { clearCart } from '../store/slices/cartSlice';
import { Restaurant, Product } from '@food-ordering/types';

interface Review {
    _id: string;
    user: {
        firstName: string;
        lastName: string;
    };
    rating: number;
    foodRating?: number;
    serviceRating?: number;
    deliveryRating?: number;
    comment?: string;
    photos?: string[];
    helpfulCount: number;
    restaurantResponse?: {
        comment: string;
        respondedAt: string;
    };
    createdAt: string;
}

const RestaurantDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);

    const cart = useSelector((state: RootState) => state.cart);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products
                const productsResponse = await api.get(`/restaurants/${id}/products`);
                setProducts(productsResponse.data.data.products);

                // Fetch restaurant details
                const restResponse = await api.get('/restaurants');
                const found = restResponse.data.data.restaurants.find((r: any) => r._id === id || r.id === id);
                if (found) setRestaurant(found);

                // Fetch reviews
                fetchReviews(1);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const fetchReviews = async (page: number) => {
        try {
            const response = await api.get(`/reviews/restaurant/${id}?page=${page}&limit=5`);
            setReviews(response.data.data.reviews);
            setTotalReviews(response.data.data.pagination.total);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        }
    };

    const handleReviewPageChange = (_: any, page: number) => {
        setReviewsPage(page);
        fetchReviews(page);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

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

                        {/* Reviews Section */}
                        <Box sx={{ mt: 6 }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                                Customer Reviews ({totalReviews})
                            </Typography>

                            {reviews.length === 0 ? (
                                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                                    <Typography color="text.secondary">
                                        No reviews yet. Be the first to review!
                                    </Typography>
                                </Paper>
                            ) : (
                                <>
                                    {reviews.map((review) => (
                                        <Paper key={review._id} sx={{ p: 3, mb: 2, borderRadius: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        {review.user.firstName[0]}{review.user.lastName[0]}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography fontWeight="bold">
                                                            {review.user.firstName} {review.user.lastName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDate(review.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Rating value={review.rating} readOnly size="small" />
                                            </Box>

                                            {/* Detailed Ratings */}
                                            {(review.foodRating || review.serviceRating || review.deliveryRating) && (
                                                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                                                    {review.foodRating && (
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Food
                                                            </Typography>
                                                            <Rating value={review.foodRating} readOnly size="small" />
                                                        </Box>
                                                    )}
                                                    {review.serviceRating && (
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Service
                                                            </Typography>
                                                            <Rating value={review.serviceRating} readOnly size="small" />
                                                        </Box>
                                                    )}
                                                    {review.deliveryRating && (
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Delivery
                                                            </Typography>
                                                            <Rating value={review.deliveryRating} readOnly size="small" />
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}

                                            {review.comment && (
                                                <Typography variant="body2" sx={{ mb: 2 }}>
                                                    {review.comment}
                                                </Typography>
                                            )}

                                            {/* Restaurant Response */}
                                            {review.restaurantResponse && (
                                                <Box sx={{ mt: 2, p: 2, bgcolor: '#F5F6FA', borderRadius: 2 }}>
                                                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                                                        Response from {restaurant.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {review.restaurantResponse.comment}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(review.restaurantResponse.respondedAt)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Paper>
                                    ))}

                                    {totalReviews > 5 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                            <Pagination
                                                count={Math.ceil(totalReviews / 5)}
                                                page={reviewsPage}
                                                onChange={handleReviewPageChange}
                                                color="primary"
                                            />
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>
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
