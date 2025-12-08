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
    Fade,
    Slide,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Badge,
    Tabs,
    Tab,
    Fab,
} from '@mui/material';
import {
    Star,
    AccessTime,
    DeliveryDining,
    ShoppingCart,
    Favorite,
    FavoriteBorder,
    LocalOffer,
    ThumbUp,
    Comment,
    Photo,
    ArrowBack,
    Add,
    Remove,
    Info,
    Restaurant as RestaurantIcon,
    Schedule,
    LocationOn,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { RootState } from '../store';
import { clearCart, addToCart, removeFromCart } from '../store/slices/cartSlice';
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
    const [activeTab, setActiveTab] = useState(0);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

    const toggleFavorite = (productId: string) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(productId)) {
            newFavorites.delete(productId);
        } else {
            newFavorites.add(productId);
        }
        setFavorites(newFavorites);
    };

    const groupedProducts = products.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    const categories = Object.keys(groupedProducts);

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
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Floating Background Elements */}
            <Box sx={{
                position: 'absolute',
                top: '10%',
                left: '5%',
                width: 200,
                height: 200,
                borderRadius: '50%',
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                animation: 'float 6s ease-in-out infinite'
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: '20%',
                right: '10%',
                width: 150,
                height: 150,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 215, 0, 0.1)',
                animation: 'float 8s ease-in-out infinite reverse'
            }} />

            {/* Back Button */}
            <IconButton
                onClick={() => navigate('/')}
                sx={{
                    position: 'fixed',
                    top: 20,
                    left: 20,
                    zIndex: 1000,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                        bgcolor: 'white',
                        transform: 'scale(1.1)'
                    },
                    transition: 'all 0.3s ease'
                }}
            >
                <ArrowBack />
            </IconButton>

            {/* Hero Section */}
            <Box
                sx={{
                    height: { xs: 350, md: 400 },
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
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 150,
                        background: 'linear-gradient(transparent, rgba(245,247,250,0.9))',
                    }
                }}
            >
                <Container maxWidth="lg" sx={{
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    pb: 6,
                    zIndex: 2
                }}>
                    <Box sx={{ color: 'white', maxWidth: 600 }}>
                        <Fade in={true} timeout={800}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontWeight: 900,
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    lineHeight: 1.1,
                                    mb: 2,
                                    textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                }}
                            >
                                {restaurant.name}
                            </Typography>
                        </Fade>

                        <Fade in={true} timeout={1000}>
                            <Typography
                                variant="h5"
                                sx={{
                                    opacity: 0.95,
                                    mb: 3,
                                    fontWeight: 400,
                                    lineHeight: 1.4,
                                    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                                }}
                            >
                                {restaurant.description}
                            </Typography>
                        </Fade>

                        <Fade in={true} timeout={1200}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                                <Chip
                                    icon={<Star sx={{ color: '#FFD700 !important' }} />}
                                    label={`${restaurant.rating} ★`}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.95)',
                                        color: '#1a1a1a',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        px: 2,
                                        py: 1,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                    }}
                                />
                                <Chip
                                    icon={<AccessTime sx={{ color: '#666' }} />}
                                    label={restaurant.deliveryTime}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.95)',
                                        color: '#333',
                                        fontWeight: 600,
                                        px: 2,
                                        py: 1,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                    }}
                                />
                                <Chip
                                    icon={<DeliveryDining sx={{ color: '#666' }} />}
                                    label={`Min $${restaurant.minOrder}`}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.95)',
                                        color: '#333',
                                        fontWeight: 600,
                                        px: 2,
                                        py: 1,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                    }}
                                />
                            </Box>
                        </Fade>

                        <Fade in={true} timeout={1400}>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<RestaurantIcon />}
                                    sx={{
                                        bgcolor: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                        color: 'white',
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 3,
                                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                                        '&:hover': {
                                            bgcolor: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    View Menu
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<LocationOn />}
                                    sx={{
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        borderWidth: 2,
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 3,
                                        fontWeight: 600,
                                        backdropFilter: 'blur(10px)',
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Get Directions
                                </Button>
                            </Box>
                        </Fade>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 10 }}>
                <Paper sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                    bgcolor: 'white'
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            bgcolor: 'grey.50',
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                fontSize: '1rem',
                                py: 2,
                                px: 4,
                                minHeight: 64
                            }
                        }}
                    >
                        <Tab
                            icon={<RestaurantIcon />}
                            label={`Menu (${products.length} items)`}
                            iconPosition="start"
                        />
                        <Tab
                            icon={<Comment />}
                            label={`Reviews (${totalReviews})`}
                            iconPosition="start"
                        />
                    </Tabs>

                    {/* Menu Tab */}
                    {activeTab === 0 && (
                        <Box sx={{ p: 4 }}>
                            {products.length === 0 ? (
                                <Box sx={{
                                    textAlign: 'center',
                                    py: 8,
                                    bgcolor: 'grey.50',
                                    borderRadius: 3
                                }}>
                                    <RestaurantIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No items available yet
                                    </Typography>
                                    <Typography variant="body2" color="text.disabled">
                                        Check back later for delicious offerings!
                                    </Typography>
                                </Box>
                            ) : (
                                <Box>
                                    {categories.map((category, categoryIndex) => (
                                        <Fade in={true} timeout={800 + categoryIndex * 200} key={category}>
                                            <Box sx={{ mb: 6 }}>
                                                <Typography
                                                    variant="h4"
                                                    sx={{
                                                        fontWeight: 800,
                                                        mb: 4,
                                                        color: 'primary.main',
                                                        position: 'relative',
                                                        '&::after': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            bottom: -8,
                                                            left: 0,
                                                            width: 60,
                                                            height: 4,
                                                            bgcolor: 'primary.main',
                                                            borderRadius: 2
                                                        }
                                                    }}
                                                >
                                                    {category}
                                                </Typography>

                                                <Grid container spacing={3}>
                                                    {groupedProducts[category].map((product, index) => (
                                                        <Grid item xs={12} md={6} key={product._id}>
                                                            <Slide direction="up" in={true} timeout={1000 + index * 100}>
                                                                <Card sx={{
                                                                    borderRadius: 4,
                                                                    overflow: 'hidden',
                                                                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    cursor: 'pointer',
                                                                    position: 'relative',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-8px)',
                                                                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                                                                    }
                                                                }}>
                                                                    <Box sx={{ position: 'relative' }}>
                                                                        <CardMedia
                                                                            component="img"
                                                                            height="200"
                                                                            image={product.image}
                                                                            alt={product.name}
                                                                            sx={{
                                                                                objectFit: 'cover',
                                                                                transition: 'transform 0.3s ease',
                                                                                '&:hover': { transform: 'scale(1.05)' }
                                                                            }}
                                                                        />
                                                                        <IconButton
                                                                            onClick={() => toggleFavorite(product._id || '')}
                                                                            sx={{
                                                                                position: 'absolute',
                                                                                top: 12,
                                                                                right: 12,
                                                                                bgcolor: 'rgba(255,255,255,0.9)',
                                                                                backdropFilter: 'blur(10px)',
                                                                                '&:hover': { bgcolor: 'white' }
                                                                            }}
                                                                        >
                                                                            {favorites.has(product._id || '') ? (
                                                                                <Favorite sx={{ color: 'error.main' }} />
                                                                            ) : (
                                                                                <FavoriteBorder sx={{ color: 'grey.600' }} />
                                                                            )}
                                                                        </IconButton>

                                                                        {product.isAvailable ? (
                                                                            <Chip
                                                                                label="Available"
                                                                                sx={{
                                                                                    position: 'absolute',
                                                                                    top: 12,
                                                                                    left: 12,
                                                                                    bgcolor: 'success.main',
                                                                                    color: 'white',
                                                                                    fontWeight: 600
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <Chip
                                                                                label="Unavailable"
                                                                                sx={{
                                                                                    position: 'absolute',
                                                                                    top: 12,
                                                                                    left: 12,
                                                                                    bgcolor: 'error.main',
                                                                                    color: 'white',
                                                                                    fontWeight: 600
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Box>

                                                                    <CardContent sx={{ p: 3 }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                                            <Box sx={{ flex: 1 }}>
                                                                                <Typography
                                                                                    variant="h6"
                                                                                    sx={{
                                                                                        fontWeight: 700,
                                                                                        mb: 1,
                                                                                        lineHeight: 1.3
                                                                                    }}
                                                                                >
                                                                                    {product.name}
                                                                                </Typography>
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    color="text.secondary"
                                                                                    sx={{
                                                                                        display: '-webkit-box',
                                                                                        WebkitLineClamp: 2,
                                                                                        WebkitBoxOrient: 'vertical',
                                                                                        overflow: 'hidden',
                                                                                        lineHeight: 1.4
                                                                                    }}
                                                                                >
                                                                                    {product.description}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Typography
                                                                                variant="h5"
                                                                                sx={{
                                                                                    fontWeight: 800,
                                                                                    color: 'primary.main',
                                                                                    ml: 2
                                                                                }}
                                                                            >
                                                                                ${product.price.toFixed(2)}
                                                                            </Typography>
                                                                        </Box>

                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                <LocalOffer sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {product.category}
                                                                                </Typography>
                                                                            </Box>

                                                                            {(() => {
                                                                                const cartItem = cart.items.find(item => item._id === product._id);
                                                                                return cartItem ? (
                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        bgcolor: 'primary.main',
                                                                                        borderRadius: 20,
                                                                                        px: 1
                                                                                    }}>
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            onClick={() => dispatch(removeFromCart(product._id || ''))}
                                                                                            sx={{ color: 'white', p: 0.5 }}
                                                                                        >
                                                                                            <Remove fontSize="small" />
                                                                                        </IconButton>
                                                                                        <Typography sx={{ mx: 1, color: 'white', fontWeight: 600 }}>
                                                                                            {cartItem.quantity}
                                                                                        </Typography>
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            onClick={() => dispatch(addToCart({ product, restaurantId: restaurant._id || '' }))}
                                                                                            sx={{ color: 'white', p: 0.5 }}
                                                                                        >
                                                                                            <Add fontSize="small" />
                                                                                        </IconButton>
                                                                                    </Box>
                                                                                ) : (
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        size="small"
                                                                                        onClick={() => dispatch(addToCart({ product, restaurantId: restaurant._id || '' }))}
                                                                                        disabled={!product.isAvailable}
                                                                                        sx={{
                                                                                            borderRadius: 20,
                                                                                            px: 3,
                                                                                            fontWeight: 600,
                                                                                            textTransform: 'none'
                                                                                        }}
                                                                                    >
                                                                                        Add to Cart
                                                                                    </Button>
                                                                                );
                                                                            })()}
                                                                        </Box>
                                                                    </CardContent>
                                                                </Card>
                                                            </Slide>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Box>
                                        </Fade>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 1 && (
                        <Box sx={{ p: 4 }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                                Customer Reviews ({totalReviews})
                            </Typography>

                            {reviews.length === 0 ? (
                                <Paper sx={{
                                    p: 6,
                                    textAlign: 'center',
                                    borderRadius: 4,
                                    bgcolor: 'grey.50',
                                    border: '2px dashed',
                                    borderColor: 'grey.300'
                                }}>
                                    <Comment sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No reviews yet
                                    </Typography>
                                    <Typography variant="body2" color="text.disabled">
                                        Be the first to review this restaurant!
                                    </Typography>
                                </Paper>
                            ) : (
                                <>
                                    {reviews.map((review, index) => (
                                        <Fade in={true} timeout={800 + index * 100} key={review._id}>
                                            <Paper sx={{
                                                p: 4,
                                                mb: 3,
                                                borderRadius: 4,
                                                boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                                                border: '1px solid',
                                                borderColor: 'grey.100',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: '0 12px 35px rgba(0,0,0,0.12)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Avatar sx={{
                                                            bgcolor: 'primary.main',
                                                            width: 50,
                                                            height: 50,
                                                            fontSize: '1.2rem',
                                                            fontWeight: 700
                                                        }}>
                                                            {review.user.firstName[0]}{review.user.lastName[0]}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="h6" fontWeight="bold">
                                                                {review.user.firstName} {review.user.lastName}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {formatDate(review.createdAt)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Rating value={review.rating} readOnly size="small" />
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {review.rating}/5
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Detailed Ratings */}
                                                {(review.foodRating || review.serviceRating || review.deliveryRating) && (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        gap: 4,
                                                        mb: 3,
                                                        p: 3,
                                                        bgcolor: 'grey.50',
                                                        borderRadius: 3,
                                                        flexWrap: 'wrap'
                                                    }}>
                                                        {review.foodRating && (
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Food Quality
                                                                </Typography>
                                                                <Rating value={review.foodRating} readOnly size="small" />
                                                                <Typography variant="caption" fontWeight="bold">
                                                                    {review.foodRating}/5
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {review.serviceRating && (
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Service
                                                                </Typography>
                                                                <Rating value={review.serviceRating} readOnly size="small" />
                                                                <Typography variant="caption" fontWeight="bold">
                                                                    {review.serviceRating}/5
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {review.deliveryRating && (
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Delivery
                                                                </Typography>
                                                                <Rating value={review.deliveryRating} readOnly size="small" />
                                                                <Typography variant="caption" fontWeight="bold">
                                                                    {review.deliveryRating}/5
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}

                                                {review.comment && (
                                                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                                                        "{review.comment}"
                                                    </Typography>
                                                )}

                                                {/* Photos */}
                                                {review.photos && review.photos.length > 0 && (
                                                    <Box sx={{ mb: 3 }}>
                                                        <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Photo fontSize="small" />
                                                            Photos ({review.photos.length})
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                            {review.photos.slice(0, 4).map((photo, photoIndex) => (
                                                                <Box
                                                                    key={photoIndex}
                                                                    component="img"
                                                                    src={photo}
                                                                    sx={{
                                                                        width: 80,
                                                                        height: 80,
                                                                        borderRadius: 2,
                                                                        objectFit: 'cover',
                                                                        cursor: 'pointer',
                                                                        transition: 'transform 0.2s ease',
                                                                        '&:hover': { transform: 'scale(1.05)' }
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Restaurant Response */}
                                                {review.restaurantResponse && (
                                                    <Box sx={{
                                                        mt: 3,
                                                        p: 3,
                                                        bgcolor: 'primary.50',
                                                        borderRadius: 3,
                                                        border: '1px solid',
                                                        borderColor: 'primary.200'
                                                    }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                                                            Response from {restaurant.name}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            {review.restaurantResponse.comment}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDate(review.restaurantResponse.respondedAt)}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Helpful Count */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
                                                    <Button
                                                        startIcon={<ThumbUp />}
                                                        size="small"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        Helpful ({review.helpfulCount})
                                                    </Button>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Verified Review
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </Fade>
                                    ))}

                                    {totalReviews > 5 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                            <Pagination
                                                count={Math.ceil(totalReviews / 5)}
                                                page={reviewsPage}
                                                onChange={handleReviewPageChange}
                                                color="primary"
                                                size="large"
                                                sx={{
                                                    '& .MuiPaginationItem-root': {
                                                        fontSize: '1rem',
                                                        fontWeight: 600
                                                    }
                                                }}
                                            />
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>
                    )}
                </Paper>

                {/* Floating Cart Button */}
                {cart.items.length > 0 && (
                    <Fab
                        color="primary"
                        sx={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            zIndex: 1000,
                            width: 70,
                            height: 70,
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                        }}
                        onClick={() => navigate('/checkout')}
                    >
                        <Badge badgeContent={cart.items.length} color="error">
                            <ShoppingCart sx={{ fontSize: 28 }} />
                        </Badge>
                    </Fab>
                )}
            </Container>
        </Box>
    );
};

export default RestaurantDetails;
