import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Button,
    Paper,
    CircularProgress,
    Chip,
    Avatar,
    Rating,
    Pagination,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Badge,
    Tabs,
    Tab,
    Divider,
} from '@mui/material';
import {
    Star,
    AccessTime,
    DeliveryDining,
    ShoppingCart,
    Restaurant as RestaurantIcon,
    LocationOn,
    Comment,
    ArrowBack,
    Add,
    Remove,
    LocalOffer,
    ThumbUp,
    Photo,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { RootState } from '../store';
import { addToCart, removeFromCart } from '../store/slices/cartSlice';
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
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'background.default'
            }}>
                <CircularProgress size={60} sx={{ color: 'primary.main' }} />
            </Box>
        );
    }

    if (!restaurant) {
        return (
            <Container sx={{
                py: 8,
                textAlign: 'center',
                backgroundColor: 'background.default',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Typography variant="h4" sx={{ mb: 4, color: 'text.primary' }}>
                    Restaurant not found
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/')}
                    sx={{
                        borderRadius: '4px',
                        px: 6,
                        py: 1.5,
                        fontWeight: 700
                    }}
                >
                    Back to Home
                </Button>
            </Container>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: 'background.default'
        }}>

            {/* Header with Controls */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
                backgroundColor: 'background.default',
                borderBottom: '1px solid #e0e0e0',
                px: 4,
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'none'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <IconButton onClick={() => navigate('/')} sx={{ color: 'text.primary' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
                        {restaurant.name}
                    </Typography>
                </Box>
            </Box>

            {/* Hero Section */}
            <Box sx={{
                height: { xs: 300, md: 400 },
                mt: 12, // Account for fixed header
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${restaurant.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(4px) scale(1.1)',
                    transform: 'translateZ(0)',
                    zIndex: 1
                }} />
                
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2
                }} />
                
                <Container maxWidth="lg" sx={{
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 3,
                    py: 6
                }}>
                    {/* Restaurant Info */}
                    <Box sx={{
                        flex: 1,
                        color: 'text.primary',
                        maxWidth: { xs: '100%', md: 600 }
                    }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                lineHeight: 1.1,
                                mb: 3,
                                color: 'text.primary'
                            }}
                        >
                            {restaurant.name}
                        </Typography>

                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 500,
                                lineHeight: 1.6,
                                mb: 4,
                                opacity: 0.95,
                                fontSize: { xs: '1.1rem', md: '1.3rem' },
                                color: 'text.secondary'
                            }}
                        >
                            {restaurant.description}
                        </Typography>

                        {/* Restaurant Details Grid */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Chip
                                        icon={<Star sx={{ color: '#FFD700', fontSize: '1.2rem' }} />}
                                        label={`${restaurant.rating}`}
                                        sx={{
                                            bgcolor: 'background.paper',
                                            color: 'text.primary',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            px: 2,
                                            py: 1,
                                            borderRadius: '4px',
                                            mb: 1,
                                            border: '1px solid #e0e0e0'
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        Rating
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Chip
                                        icon={<AccessTime sx={{ color: '#1a1a1a', fontSize: '1.2rem' }} />}
                                        label={restaurant.deliveryTime}
                                        sx={{
                                            bgcolor: 'background.paper',
                                            color: 'text.primary',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            px: 2,
                                            py: 1,
                                            borderRadius: '4px',
                                            mb: 1,
                                            border: '1px solid #e0e0e0'
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        Delivery Time
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Chip
                                        icon={<DeliveryDining sx={{ color: '#4CAF50', fontSize: '1.2rem' }} />}
                                        label={`$${restaurant.minOrder}+`}
                                        sx={{
                                            bgcolor: 'background.paper',
                                            color: 'text.primary',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            px: 2,
                                            py: 1,
                                            borderRadius: '4px',
                                            mb: 1,
                                            border: '1px solid #e0e0e0'
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        Min Order
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Chip
                                        icon={<RestaurantIcon sx={{ color: '#FFC107', fontSize: '1.2rem' }} />}
                                        label={restaurant.cuisine || 'Various'}
                                        sx={{
                                            bgcolor: 'background.paper',
                                            color: 'text.primary',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            px: 2,
                                            py: 1,
                                            borderRadius: '4px',
                                            mb: 1,
                                            border: '1px solid #e0e0e0'
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        Cuisine
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<RestaurantIcon />}
                                onClick={() => setActiveTab(0)}
                                sx={{
                                    borderRadius: '4px',
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 700,
                                    fontSize: '1rem'
                                }}
                            >
                                View Menu
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<LocationOn />}
                                sx={{
                                    color: 'text.primary',
                                    borderColor: '#e0e0e0',
                                    borderWidth: 2,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    '&:hover': {
                                        borderColor: 'text.primary',
                                        bgcolor: 'background.paper'
                                    }
                                }}
                            >
                                Get Directions
                            </Button>
                        </Box>
                    </Box>
                    
                    {/* Restaurant Image Card */}
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: { xs: 4, md: 0 }
                    }}>
                        <Card sx={{
                            width: { xs: 200, md: 250 },
                            height: { xs: 200, md: 250 },
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: 'none',
                            border: '1px solid #e0e0e0',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                borderColor: 'text.primary'
                            }
                        }}>
                            <CardMedia
                                component="img"
                                height="100%"
                                image={restaurant.imageUrl}
                                alt={restaurant.name}
                                sx={{
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease'
                                }}
                            />
                        </Card>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 4, position: 'relative', zIndex: 10, pb: 8 }}>
                {/* Restaurant Info Section */}
                <Paper sx={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: 'none',
                    bgcolor: 'background.paper',
                    border: '1px solid #e0e0e0',
                    mb: 4
                }}>
                    <Box sx={{ p: { xs: 3, md: 4 } }}>
                        {/* Restaurant Contact Info */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                            gap: 3,
                            mb: 4,
                            borderBottom: '1px solid #e0e0e0',
                            pb: 4
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <RestaurantIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                        Address
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium" sx={{ color: 'text.primary' }}>
                                        {restaurant.address}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <RestaurantIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                        Phone
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium" sx={{ color: 'text.primary' }}>
                                        {restaurant.phone || 'Not available'}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <RestaurantIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                        Hours
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium" sx={{ color: 'text.primary' }}>
                                        {restaurant.hours && restaurant.hours.length > 0
                                            ? `${restaurant.hours[0].openTime} - ${restaurant.hours[0].closeTime}`
                                            : 'Not available'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        {/* Restaurant Description */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'text.primary' }}>
                                About {restaurant.name}
                            </Typography>
                            <Typography variant="body1" sx={{
                                lineHeight: 1.8,
                                color: 'text.secondary'
                            }}>
                                {restaurant.description || 'A delicious dining experience awaits you at our restaurant.'}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
                
                {/* Main Content Tabs */}
                <Paper sx={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: 'none',
                    bgcolor: 'background.paper',
                    border: '1px solid #e0e0e0'
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                        sx={{
                            borderBottom: 1,
                            borderColor: '#e0e0e0',
                            bgcolor: 'background.paper',
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                fontSize: '1rem',
                                py: 2,
                                px: 4,
                                minHeight: 64,
                                color: 'text.primary'
                            },
                            '& .Mui-selected': {
                                color: 'primary.main'
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'primary.main'
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
                        <Box sx={{ p: { xs: 3, md: 4 } }}>
                            {products.length === 0 ? (
                                <Box sx={{
                                    textAlign: 'center',
                                    py: 8,
                                    bgcolor: 'background.paper',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e0e0'
                                }}>
                                    <RestaurantIcon sx={{
                                        fontSize: 64,
                                        color: 'grey.400',
                                        mb: 2
                                    }} />
                                    <Typography variant="h6" sx={{
                                        color: 'text.secondary',
                                        mb: 1
                                    }}>
                                        No items available yet
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                        Check back later for delicious offerings!
                                    </Typography>
                                </Box>
                            ) : (
                                <Box>
                                    {categories.map((category, categoryIndex) => (
                                        <Box sx={{ mb: 6 }} key={category}>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontWeight: 800,
                                                    mb: 4,
                                                    color: 'text.primary',
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
                                                        <Card sx={{
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            boxShadow: 'none',
                                                            border: '1px solid #e0e0e0',
                                                            transition: 'all 0.3s ease',
                                                            cursor: 'pointer',
                                                            position: 'relative',
                                                            '&:hover': {
                                                                transform: 'translateY(-4px)',
                                                                borderColor: 'text.primary'
                                                            },
                                                            bgcolor: 'background.paper'
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
                                                                                lineHeight: 1.3,
                                                                                color: 'text.primary'
                                                                            }}
                                                                        >
                                                                            {product.name}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                display: '-webkit-box',
                                                                                WebkitLineClamp: 2,
                                                                                WebkitBoxOrient: 'vertical',
                                                                                overflow: 'hidden',
                                                                                lineHeight: 1.4,
                                                                                color: 'text.secondary'
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
                                                                        <LocalOffer sx={{
                                                                            fontSize: 16,
                                                                            color: 'text.secondary'
                                                                        }} />
                                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                                                                                borderRadius: '4px',
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
                                                                                    borderRadius: '4px',
                                                                                    px: 3,
                                                                                    fontWeight: 600,
                                                                                    textTransform: 'none',
                                                                                    bgcolor: 'primary.main',
                                                                                    '&:hover': {
                                                                                        bgcolor: 'primary.dark'
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Add to Cart
                                                                            </Button>
                                                                        );
                                                                    })()}
                                                                </Box>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 1 && (
                        <Box sx={{ p: { xs: 3, md: 4 } }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{
                                mb: 4,
                                color: 'text.primary'
                            }}>
                                Customer Reviews ({totalReviews})
                            </Typography>

                            {reviews.length === 0 ? (
                                <Paper sx={{
                                    p: 6,
                                    textAlign: 'center',
                                    borderRadius: '8px',
                                    bgcolor: 'background.paper',
                                    border: '1px solid #e0e0e0',
                                    borderColor: '#e0e0e0'
                                }}>
                                    <Comment sx={{
                                        fontSize: 64,
                                        color: 'grey.400',
                                        mb: 2
                                    }} />
                                    <Typography variant="h6" sx={{
                                        color: 'text.secondary',
                                        mb: 1
                                    }}>
                                        No reviews yet
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                        Be the first to review this restaurant!
                                    </Typography>
                                </Paper>
                            ) : (
                                <>
                                    {reviews.map((review, index) => (
                                        <Paper sx={{
                                            p: 4,
                                            mb: 3,
                                            borderRadius: '8px',
                                            boxShadow: 'none',
                                            border: '1px solid #e0e0e0',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: 'text.primary',
                                                transform: 'translateY(-2px)'
                                            },
                                            bgcolor: 'background.paper'
                                        }} key={review._id}>
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
                                                        <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
                                                            {review.user.firstName} {review.user.lastName}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                            {formatDate(review.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Rating value={review.rating} readOnly size="small" sx={{ color: 'primary.main' }} />
                                                    <Typography variant="body2" fontWeight="bold" sx={{ color: 'text.primary' }}>
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
                                                    bgcolor: 'background.paper',
                                                    borderRadius: '8px',
                                                    flexWrap: 'wrap',
                                                    border: '1px solid #e0e0e0'
                                                }}>
                                                    {review.foodRating && (
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="caption" sx={{
                                                                color: 'text.secondary',
                                                                display: 'block'
                                                            }}>
                                                                Food Quality
                                                            </Typography>
                                                            <Rating value={review.foodRating} readOnly size="small" sx={{ color: 'primary.main' }} />
                                                            <Typography variant="caption" fontWeight="bold" sx={{ color: 'text.primary' }}>
                                                                {review.foodRating}/5
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {review.serviceRating && (
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="caption" sx={{
                                                                color: 'text.secondary',
                                                                display: 'block'
                                                            }}>
                                                                Service
                                                            </Typography>
                                                            <Rating value={review.serviceRating} readOnly size="small" sx={{ color: 'primary.main' }} />
                                                            <Typography variant="caption" fontWeight="bold" sx={{ color: 'text.primary' }}>
                                                                {review.serviceRating}/5
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {review.deliveryRating && (
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="caption" sx={{
                                                                color: 'text.secondary',
                                                                display: 'block'
                                                            }}>
                                                                Delivery
                                                            </Typography>
                                                            <Rating value={review.deliveryRating} readOnly size="small" sx={{ color: 'primary.main' }} />
                                                            <Typography variant="caption" fontWeight="bold" sx={{ color: 'text.primary' }}>
                                                                {review.deliveryRating}/5
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}

                                            {review.comment && (
                                                <Typography variant="body1" sx={{
                                                    mb: 3,
                                                    lineHeight: 1.6,
                                                    color: 'text.secondary',
                                                    fontStyle: 'italic'
                                                }}>
                                                    "{review.comment}"
                                                </Typography>
                                            )}

                                            {/* Photos */}
                                            {review.photos && review.photos.length > 0 && (
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography variant="subtitle2" sx={{
                                                        mb: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        color: 'text.primary'
                                                    }}>
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
                                                                    borderRadius: '4px',
                                                                    objectFit: 'cover',
                                                                    cursor: 'pointer',
                                                                    transition: 'transform 0.2s ease',
                                                                    '&:hover': { transform: 'scale(1.05)' },
                                                                    border: '1px solid #e0e0e0'
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
                                                    borderRadius: '8px',
                                                    border: '1px solid',
                                                    borderColor: 'primary.200'
                                                }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{
                                                        color: 'primary.main',
                                                        mb: 1
                                                    }}>
                                                        Response from {restaurant.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        mb: 1,
                                                        color: 'text.primary'
                                                    }}>
                                                        {review.restaurantResponse.comment}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {formatDate(review.restaurantResponse.respondedAt)}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Helpful Count */}
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mt: 3,
                                                pt: 3,
                                                borderTop: '1px solid',
                                                borderColor: '#e0e0e0'
                                            }}>
                                                <Button
                                                    startIcon={<ThumbUp />}
                                                    size="small"
                                                    sx={{ color: 'text.secondary' }}
                                                >
                                                    Helpful ({review.helpfulCount})
                                                </Button>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    Verified Review
                                                </Typography>
                                            </Box>
                                        </Paper>
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
                                                        fontWeight: 600,
                                                        color: 'text.primary'
                                                    },
                                                    '& .Mui-selected': {
                                                        bgcolor: 'primary.main',
                                                        color: 'white'
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
                    <Button
                        variant="contained"
                        sx={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            zIndex: 1000,
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                            bgcolor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => navigate('/checkout')}
                    >
                        <Badge badgeContent={cart.items.length} color="error">
                            <ShoppingCart sx={{ fontSize: 24, color: 'white' }} />
                        </Badge>
                    </Button>
                )}
            </Container>
        </Box>
    );
};

export default RestaurantDetails;
