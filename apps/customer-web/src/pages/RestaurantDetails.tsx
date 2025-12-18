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
    Switch,
    FormControlLabel,
    Divider,
    Tooltip,
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
    Restaurant as RestaurantIcon,
    LocationOn,
    DarkMode,
    LightMode,
    Notifications,
    Share,
    Info,
    Phone,
    Schedule,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { RootState } from '../store';
import { addToCart, removeFromCart } from '../store/slices/cartSlice';
import { Restaurant, Product } from '@food-ordering/types';
import { useDarkMode } from '../context/DarkModeContext';

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

    const { darkMode, toggleDarkMode } = useDarkMode();
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

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: restaurant?.name || 'Restaurant',
                text: `Check out ${restaurant?.name} on Mesob Food Ordering!`,
                url: window.location.href,
            });
        } else {
            alert('Share functionality not supported in your browser');
        }
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
                background: darkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                <CircularProgress size={60} thickness={4} sx={{ color: darkMode ? 'white' : 'primary.main' }} />
            </Box>
        );
    }

    if (!restaurant) {
        return (
            <Container sx={{
                py: 8,
                textAlign: 'center',
                background: darkMode ? '#1a1a2e' : '#f5f7fa',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Typography variant="h4" sx={{ mb: 4, color: darkMode ? 'white' : 'text.primary' }}>
                    Restaurant not found
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/')}
                    sx={{
                        bgcolor: darkMode ? 'primary.main' : 'linear-gradient(45deg, #0ea5e9 30%, #ec4899 90%)',
                        color: 'white',
                        px: 6,
                        py: 1.5,
                        borderRadius: 50
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
            background: darkMode
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.5s ease'
        }}>
            {/* Professional Header with Controls */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
                bgcolor: darkMode ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                px: 4,
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <IconButton onClick={() => navigate('/')} sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                        {restaurant.name}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Tooltip title="Share Restaurant">
                        <IconButton onClick={handleShare} sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                            <Share />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Dark Mode">
                        <IconButton onClick={toggleDarkMode} sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                            {darkMode ? <LightMode /> : <DarkMode />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Notifications">
                        <IconButton onClick={() => navigate('/notifications')} sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                            <Notifications />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Professional Hero Section */}
            <Box sx={{
                height: { xs: 400, md: 500 },
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
                    filter: 'blur(8px) scale(1.1)',
                    transform: 'translateZ(0)',
                    zIndex: 1
                }} />
                
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: darkMode
                        ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.85) 0%, rgba(22, 33, 62, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 247, 250, 0.85) 0%, rgba(195, 207, 226, 0.95) 100%)',
                    backdropFilter: 'blur(10px)',
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
                        color: darkMode ? 'white' : 'text.primary',
                        maxWidth: { xs: '100%', md: 600 }
                    }}>
                        <Fade in={true} timeout={800}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontWeight: 900,
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    lineHeight: 1.1,
                                    mb: 3,
                                    background: darkMode
                                        ? 'linear-gradient(45deg, #0ea5e9, #ec4899)'
                                        : 'linear-gradient(45deg, #0ea5e9, #ec4899)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}
                            >
                                {restaurant.name}
                            </Typography>
                        </Fade>

                        <Fade in={true} timeout={1000}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 500,
                                    lineHeight: 1.6,
                                    mb: 4,
                                    opacity: 0.95,
                                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                                }}
                            >
                                {restaurant.description}
                            </Typography>
                        </Fade>

                        {/* Restaurant Details Grid */}
                        <Fade in={true} timeout={1200}>
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Chip
                                            icon={<Star sx={{ color: '#FFD700', fontSize: '1.2rem' }} />}
                                            label={`${restaurant.rating}`}
                                            sx={{
                                                bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                                                color: darkMode ? 'white' : 'text.primary',
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                px: 2,
                                                py: 1,
                                                borderRadius: 2,
                                                mb: 1,
                                                border: darkMode ? '1px solid rgba(255,255,255,0.2)' : 'none'
                                            }}
                                        />
                                        <Typography variant="caption" sx={{ color: darkMode ? 'text.secondary' : 'text.disabled' }}>
                                            Rating
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Chip
                                            icon={<AccessTime sx={{ color: '#0ea5e9', fontSize: '1.2rem' }} />}
                                            label={restaurant.deliveryTime}
                                            sx={{
                                                bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                                                color: darkMode ? 'white' : 'text.primary',
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                px: 2,
                                                py: 1,
                                                borderRadius: 2,
                                                mb: 1,
                                                border: darkMode ? '1px solid rgba(255,255,255,0.2)' : 'none'
                                            }}
                                        />
                                        <Typography variant="caption" sx={{ color: darkMode ? 'text.secondary' : 'text.disabled' }}>
                                            Delivery Time
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Chip
                                            icon={<DeliveryDining sx={{ color: '#10b981', fontSize: '1.2rem' }} />}
                                            label={`$${restaurant.minOrder}+`}
                                            sx={{
                                                bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                                                color: darkMode ? 'white' : 'text.primary',
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                px: 2,
                                                py: 1,
                                                borderRadius: 2,
                                                mb: 1,
                                                border: darkMode ? '1px solid rgba(255,255,255,0.2)' : 'none'
                                            }}
                                        />
                                        <Typography variant="caption" sx={{ color: darkMode ? 'text.secondary' : 'text.disabled' }}>
                                            Min Order
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Chip
                                            icon={<RestaurantIcon sx={{ color: '#f59e0b', fontSize: '1.2rem' }} />}
                                            label={restaurant.cuisine || 'Various'}
                                            sx={{
                                                bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                                                color: darkMode ? 'white' : 'text.primary',
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                px: 2,
                                                py: 1,
                                                borderRadius: 2,
                                                mb: 1,
                                                border: darkMode ? '1px solid rgba(255,255,255,0.2)' : 'none'
                                            }}
                                        />
                                        <Typography variant="caption" sx={{ color: darkMode ? 'text.secondary' : 'text.disabled' }}>
                                            Cuisine
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Fade>

                        {/* Action Buttons */}
                        <Fade in={true} timeout={1400}>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<RestaurantIcon />}
                                    onClick={() => setActiveTab(0)}
                                    sx={{
                                        bgcolor: darkMode
                                            ? 'linear-gradient(45deg, #0ea5e9 30%, #ec4899 90%)'
                                            : 'linear-gradient(45deg, #0ea5e9 30%, #ec4899 90%)',
                                        color: 'white',
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 50,
                                        boxShadow: darkMode
                                            ? '0 8px 25px rgba(14, 165, 233, 0.3)'
                                            : '0 8px 25px rgba(14, 165, 233, 0.4)',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: darkMode
                                                ? '0 12px 35px rgba(14, 165, 233, 0.4)'
                                                : '0 12px 35px rgba(14, 165, 233, 0.6)'
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
                                        color: darkMode ? 'white' : 'primary.main',
                                        borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'primary.main',
                                        borderWidth: 2,
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 50,
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderColor: darkMode ? 'white' : 'primary.dark',
                                            bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(14, 165, 233, 0.1)',
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
                    
                    {/* Restaurant Image Card */}
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: { xs: 4, md: 0 }
                    }}>
                        <Fade in={true} timeout={1600}>
                            <Card sx={{
                                width: { xs: 250, md: 300 },
                                height: { xs: 250, md: 300 },
                                borderRadius: 6,
                                overflow: 'hidden',
                                boxShadow: darkMode
                                    ? '0 20px 60px rgba(0,0,0,0.5)'
                                    : '0 20px 60px rgba(0,0,0,0.2)',
                                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: darkMode
                                        ? '0 25px 80px rgba(0,0,0,0.6)'
                                        : '0 25px 80px rgba(0,0,0,0.3)'
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
                        </Fade>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 4, position: 'relative', zIndex: 10, pb: 8 }}>
                {/* Restaurant Info Section */}
                <Paper sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: darkMode
                        ? '0 20px 60px rgba(0,0,0,0.5)'
                        : '0 20px 60px rgba(0,0,0,0.1)',
                    bgcolor: darkMode ? '#1a1a2e' : 'white',
                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    mb: 4
                }}>
                    <Box sx={{ p: { xs: 3, md: 4 } }}>
                        {/* Restaurant Contact Info */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                            gap: 3,
                            mb: 4,
                            borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                            pb: 4
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Info sx={{ color: darkMode ? 'primary.main' : 'primary.dark', fontSize: '1.5rem' }} />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: darkMode ? 'text.secondary' : 'text.disabled', mb: 0.5 }}>
                                        Address
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium" sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                        {restaurant.address}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Phone sx={{ color: darkMode ? 'primary.main' : 'primary.dark', fontSize: '1.5rem' }} />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: darkMode ? 'text.secondary' : 'text.disabled', mb: 0.5 }}>
                                        Phone
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium" sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                        {restaurant.phone || 'Not available'}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Schedule sx={{ color: darkMode ? 'primary.main' : 'primary.dark', fontSize: '1.5rem' }} />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: darkMode ? 'text.secondary' : 'text.disabled', mb: 0.5 }}>
                                        Hours
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium" sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                        {restaurant.hours && restaurant.hours.length > 0
                                            ? `${restaurant.hours[0].openTime} - ${restaurant.hours[0].closeTime}`
                                            : 'Not available'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        {/* Restaurant Description */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: darkMode ? 'white' : 'text.primary' }}>
                                About {restaurant.name}
                            </Typography>
                            <Typography variant="body1" sx={{
                                lineHeight: 1.8,
                                color: darkMode ? 'text.secondary' : 'text.primary'
                            }}>
                                {restaurant.description || 'A delicious dining experience awaits you at our restaurant.'}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
                
                {/* Main Content Tabs */}
                <Paper sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: darkMode
                        ? '0 20px 60px rgba(0,0,0,0.5)'
                        : '0 20px 60px rgba(0,0,0,0.1)',
                    bgcolor: darkMode ? '#1a1a2e' : 'white',
                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                        sx={{
                            borderBottom: 1,
                            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'divider',
                            bgcolor: darkMode ? '#16213e' : 'grey.50',
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                fontSize: '1rem',
                                py: 2,
                                px: 4,
                                minHeight: 64,
                                color: darkMode ? 'text.secondary' : 'text.primary'
                            },
                            '& .Mui-selected': {
                                color: darkMode ? 'primary.main' : 'primary.dark'
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: darkMode ? 'primary.main' : 'primary.dark'
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
                                    bgcolor: darkMode ? '#16213e' : 'grey.50',
                                    borderRadius: 3,
                                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                }}>
                                    <RestaurantIcon sx={{
                                        fontSize: 64,
                                        color: darkMode ? 'grey.500' : 'grey.400',
                                        mb: 2
                                    }} />
                                    <Typography variant="h6" sx={{
                                        color: darkMode ? 'text.secondary' : 'text.secondary',
                                        mb: 1
                                    }}>
                                        No items available yet
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: darkMode ? 'text.disabled' : 'text.disabled' }}>
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
                                                        color: darkMode ? 'white' : 'primary.main',
                                                        position: 'relative',
                                                        '&::after': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            bottom: -8,
                                                            left: 0,
                                                            width: 60,
                                                            height: 4,
                                                            bgcolor: darkMode ? 'primary.main' : 'primary.main',
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
                                                                    boxShadow: darkMode
                                                                                        ? '0 8px 25px rgba(0,0,0,0.3)'
                                                                                        : '0 8px 25px rgba(0,0,0,0.08)',
                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    cursor: 'pointer',
                                                                    position: 'relative',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-8px)',
                                                                        boxShadow: darkMode
                                                                                            ? '0 20px 40px rgba(0,0,0,0.4)'
                                                                                            : '0 20px 40px rgba(0,0,0,0.15)'
                                                                    },
                                                                    bgcolor: darkMode ? '#1a1a2e' : 'white',
                                                                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none'
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
                                                                                bgcolor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                                                                                backdropFilter: 'blur(10px)',
                                                                                '&:hover': {
                                                                                    bgcolor: darkMode ? 'rgba(255,255,255,0.3)' : 'white'
                                                                                }
                                                                            }}
                                                                        >
                                                                            {favorites.has(product._id || '') ? (
                                                                                <Favorite sx={{ color: 'error.main' }} />
                                                                            ) : (
                                                                                <FavoriteBorder sx={{ color: darkMode ? 'white' : 'grey.600' }} />
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
                                                                                        lineHeight: 1.3,
                                                                                        color: darkMode ? 'white' : 'text.primary'
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
                                                                                        color: darkMode ? 'text.secondary' : 'text.secondary'
                                                                                    }}
                                                                                >
                                                                                    {product.description}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Typography
                                                                                variant="h5"
                                                                                sx={{
                                                                                    fontWeight: 800,
                                                                                    color: darkMode ? 'primary.main' : 'primary.main',
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
                                                                                    color: darkMode ? 'text.secondary' : 'text.secondary'
                                                                                }} />
                                                                                <Typography variant="caption" sx={{ color: darkMode ? 'text.secondary' : 'text.secondary' }}>
                                                                                    {product.category}
                                                                                </Typography>
                                                                            </Box>

                                                                            {(() => {
                                                                                const cartItem = cart.items.find(item => item._id === product._id);
                                                                                return cartItem ? (
                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        bgcolor: darkMode ? 'primary.main' : 'primary.main',
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
                                                                                            textTransform: 'none',
                                                                                            bgcolor: darkMode ? 'primary.main' : 'primary.main',
                                                                                            '&:hover': {
                                                                                                bgcolor: darkMode ? 'primary.dark' : 'primary.dark'
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
                        <Box sx={{ p: { xs: 3, md: 4 } }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{
                                mb: 4,
                                color: darkMode ? 'white' : 'text.primary'
                            }}>
                                Customer Reviews ({totalReviews})
                            </Typography>

                            {reviews.length === 0 ? (
                                <Paper sx={{
                                    p: 6,
                                    textAlign: 'center',
                                    borderRadius: 4,
                                    bgcolor: darkMode ? '#16213e' : 'grey.50',
                                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '2px dashed',
                                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'grey.300'
                                }}>
                                    <Comment sx={{
                                        fontSize: 64,
                                        color: darkMode ? 'grey.500' : 'grey.400',
                                        mb: 2
                                    }} />
                                    <Typography variant="h6" sx={{
                                        color: darkMode ? 'text.secondary' : 'text.secondary',
                                        mb: 1
                                    }}>
                                        No reviews yet
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: darkMode ? 'text.disabled' : 'text.disabled' }}>
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
                                                boxShadow: darkMode
                                                    ? '0 8px 25px rgba(0,0,0,0.3)'
                                                    : '0 8px 25px rgba(0,0,0,0.08)',
                                                border: '1px solid',
                                                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'grey.100',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: darkMode
                                                        ? '0 12px 35px rgba(0,0,0,0.4)'
                                                        : '0 12px 35px rgba(0,0,0,0.12)',
                                                    transform: 'translateY(-2px)'
                                                },
                                                bgcolor: darkMode ? '#1a1a2e' : 'white'
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Avatar sx={{
                                                            bgcolor: darkMode ? 'primary.main' : 'primary.main',
                                                            width: 50,
                                                            height: 50,
                                                            fontSize: '1.2rem',
                                                            fontWeight: 700
                                                        }}>
                                                            {review.user.firstName[0]}{review.user.lastName[0]}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                                                {review.user.firstName} {review.user.lastName}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: darkMode ? 'text.secondary' : 'text.secondary' }}>
                                                                {formatDate(review.createdAt)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Rating value={review.rating} readOnly size="small" sx={{ color: darkMode ? 'primary.main' : 'primary.main' }} />
                                                        <Typography variant="body2" fontWeight="bold" sx={{ color: darkMode ? 'white' : 'text.primary' }}>
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
                                                        bgcolor: darkMode ? '#16213e' : 'grey.50',
                                                        borderRadius: 3,
                                                        flexWrap: 'wrap',
                                                        border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                                    }}>
                                                        {review.foodRating && (
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="caption" sx={{
                                                                    color: darkMode ? 'text.secondary' : 'text.secondary',
                                                                    display: 'block'
                                                                }}>
                                                                    Food Quality
                                                                </Typography>
                                                                <Rating value={review.foodRating} readOnly size="small" sx={{ color: darkMode ? 'primary.main' : 'primary.main' }} />
                                                                <Typography variant="caption" fontWeight="bold" sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                                                    {review.foodRating}/5
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {review.serviceRating && (
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="caption" sx={{
                                                                    color: darkMode ? 'text.secondary' : 'text.secondary',
                                                                    display: 'block'
                                                                }}>
                                                                    Service
                                                                </Typography>
                                                                <Rating value={review.serviceRating} readOnly size="small" sx={{ color: darkMode ? 'primary.main' : 'primary.main' }} />
                                                                <Typography variant="caption" fontWeight="bold" sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                                                    {review.serviceRating}/5
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {review.deliveryRating && (
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="caption" sx={{
                                                                    color: darkMode ? 'text.secondary' : 'text.secondary',
                                                                    display: 'block'
                                                                }}>
                                                                    Delivery
                                                                </Typography>
                                                                <Rating value={review.deliveryRating} readOnly size="small" sx={{ color: darkMode ? 'primary.main' : 'primary.main' }} />
                                                                <Typography variant="caption" fontWeight="bold" sx={{ color: darkMode ? 'white' : 'text.primary' }}>
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
                                                        color: darkMode ? 'text.secondary' : 'text.primary',
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
                                                            color: darkMode ? 'white' : 'text.primary'
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
                                                                        borderRadius: 2,
                                                                        objectFit: 'cover',
                                                                        cursor: 'pointer',
                                                                        transition: 'transform 0.2s ease',
                                                                        '&:hover': { transform: 'scale(1.05)' },
                                                                        border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none'
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
                                                        bgcolor: darkMode ? 'rgba(14, 165, 233, 0.1)' : 'primary.50',
                                                        borderRadius: 3,
                                                        border: '1px solid',
                                                        borderColor: darkMode ? 'rgba(14, 165, 233, 0.2)' : 'primary.200'
                                                    }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{
                                                            color: darkMode ? 'primary.main' : 'primary.main',
                                                            mb: 1
                                                        }}>
                                                            Response from {restaurant.name}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            mb: 1,
                                                            color: darkMode ? 'white' : 'text.primary'
                                                        }}>
                                                            {review.restaurantResponse.comment}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: darkMode ? 'text.secondary' : 'text.secondary' }}>
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
                                                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'grey.200'
                                                }}>
                                                    <Button
                                                        startIcon={<ThumbUp />}
                                                        size="small"
                                                        sx={{ color: darkMode ? 'text.secondary' : 'text.secondary' }}
                                                    >
                                                        Helpful ({review.helpfulCount})
                                                    </Button>
                                                    <Typography variant="caption" sx={{ color: darkMode ? 'text.secondary' : 'text.secondary' }}>
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
                                                        fontWeight: 600,
                                                        color: darkMode ? 'white' : 'text.primary'
                                                    },
                                                    '& .Mui-selected': {
                                                        bgcolor: darkMode ? 'primary.main' : 'primary.main',
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
                    <Fab
                        color="primary"
                        sx={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            zIndex: 1000,
                            width: 70,
                            height: 70,
                            boxShadow: darkMode
                                ? '0 8px 25px rgba(14, 165, 233, 0.5)'
                                : '0 8px 25px rgba(102, 126, 234, 0.4)',
                            bgcolor: darkMode ? 'primary.main' : 'primary.main',
                            '&:hover': {
                                bgcolor: darkMode ? 'primary.dark' : 'primary.dark',
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => navigate('/checkout')}
                    >
                        <Badge badgeContent={cart.items.length} color="error">
                            <ShoppingCart sx={{ fontSize: 28, color: 'white' }} />
                        </Badge>
                    </Fab>
                )}
            </Container>
        </Box>
    );
};

export default RestaurantDetails;
