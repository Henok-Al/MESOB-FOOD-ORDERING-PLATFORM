import React, { useEffect, useMemo, useState } from 'react';
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
    Stack,
    Chip,
    Card,
    CardContent,
    CardMedia,
    Avatar,
    Divider,
    Fade,
    Slide,
    keyframes,
} from '@mui/material';
import {
    Search,
    DeliveryDining,
    RestaurantMenu,
    Security,
    PhoneIphone,
    Star,
    Fastfood,
    EmojiEvents,
    Bolt,
    ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import RestaurantCard from '../components/common/RestaurantCard';
import { Restaurant } from '@food-ordering/types';
import deliverBoy from '../assets/deliver-boy.png';

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cuisineFilter, setCuisineFilter] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

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

    const heroStats = [
        { label: 'Partner Restaurants', value: '500+', detail: 'Across Addis & beyond' },
        { label: 'On-time Deliveries', value: '99%', detail: 'Powered by smart logistics' },
        { label: 'Community Love', value: '4.9/5', detail: 'Avg. customer rating' },
    ];

    const features = [
        { title: 'Lightning-fast Delivery', description: 'Live GPS tracking, predictive ETAs, and insulated riders keep meals hot.', icon: DeliveryDining },
        { title: 'Curated Culinary Scene', description: 'From family-owned kitchens to bold pop-ups, discover rotating spotlights.', icon: RestaurantMenu },
        { title: 'Secure & Seamless', description: 'One-tap checkout, saved addresses, and enterprise-grade payment security.', icon: Security },
    ];

    const experienceSteps = [
        { title: 'Tell us where you are', description: 'Use quick location lookup or saved addresses for instant restaurant picks.' },
        { title: 'Dial in your cravings', description: 'Filter by cuisine, dietary tags, delivery time, or budget to find a match.' },
        { title: 'Track every milestone', description: 'Prep, pickup, and arrival updates keep you in the loop second by second.' },
    ];

    const testimonials = [
        {
            name: 'Hanna G.',
            role: 'Product Manager, Addis',
            quote: 'Mesob blends premium restaurants with reliability. My team orders daily and deliveries are consistently early.',
            rating: 5,
        },
        {
            name: 'Samuel N.',
            role: 'Founder, Addis Ababa',
            quote: 'The curated lists keep our lunches adventurous. Packaging is thoughtful and the drivers are professional.',
            rating: 5,
        },
    ];

    const categories = [
        { value: 'All', label: 'All', icon: Fastfood },
        { value: 'Traditional', label: 'Traditional', icon: EmojiEvents },
        { value: 'Burgers', label: 'Burgers', icon: Bolt },
        { value: 'Desserts', label: 'Desserts', icon: Star },
        { value: 'Healthy', label: 'Healthy', icon: RestaurantMenu },
    ];

    const uniqueCuisines = useMemo(
        () => Array.from(new Set(restaurants.map(r => r.cuisine))).filter(Boolean),
        [restaurants]
    );

    const filteredRestaurants = useMemo(() => {
        return restaurants.filter((restaurant) => {
            const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCuisine = cuisineFilter
                ? restaurant.cuisine.toLowerCase().includes(cuisineFilter.toLowerCase())
                : true;
            const matchesCategory = selectedCategory === 'All'
                ? true
                : restaurant.cuisine.toLowerCase().includes(selectedCategory.toLowerCase());
            return matchesSearch && matchesCuisine && matchesCategory;
        });
    }, [restaurants, searchTerm, cuisineFilter, selectedCategory]);

    const featuredRestaurants = filteredRestaurants.slice(0, 4);

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="40" cy="40" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.8,
            },
            '&::after': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                animation: 'float 20s ease-in-out infinite',
                '@keyframes float': {
                    '0%, 100%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                    '50%': { transform: 'translate(-50%, -50%) rotate(180deg)' }
                }
            }
        }}>

            {/* Hero Section */}
            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, py: 8 }}>
                <Fade in={true} timeout={1000}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Typography
                                variant="overline"
                                sx={{
                                    letterSpacing: 3,
                                    color: 'rgba(255,255,255,0.8)',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}
                            >
                                PREMIUM FOOD DELIVERY
                            </Typography>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontWeight: 900,
                                    mt: 2,
                                    lineHeight: 1.1,
                                    fontSize: { xs: '2.5rem', md: '4rem' },
                                    color: 'white',
                                    textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                }}
                            >
                                Ethiopia's Finest
                                <Box component="span" sx={{
                                    background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    display: 'block'
                                }}>
                                    Delivered Fresh
                                </Box>
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    mt: 3,
                                    color: 'rgba(255,255,255,0.9)',
                                    fontWeight: 400,
                                    lineHeight: 1.6,
                                    fontSize: '1.125rem'
                                }}
                            >
                                Experience culinary excellence with Ethiopia's most trusted food delivery platform.
                                Fresh ingredients, authentic flavors, delivered to your doorstep.
                            </Typography>

                            <Paper
                                component="form"
                                sx={{
                                    mt: 4,
                                    p: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderRadius: 4,
                                    backdropFilter: 'blur(25px)',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <IconButton sx={{ p: '14px', color: 'primary.main' }}>
                                    <Search />
                                </IconButton>
                                <InputBase
                                    sx={{
                                        ml: 1,
                                        flex: 1,
                                        color: 'text.primary',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        '& .MuiInputBase-input::placeholder': {
                                            color: 'text.secondary',
                                            opacity: 1,
                                            fontWeight: 400,
                                        }
                                    }}
                                    placeholder="Search restaurants, cuisines, or dishes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button
                                    variant="contained"
                                    sx={{
                                        borderRadius: 3,
                                        px: 5,
                                        py: 1.8,
                                        bgcolor: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                        '&:hover': {
                                            bgcolor: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Explore
                                </Button>
                            </Paper>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ mt: 6 }}>
                                {heroStats.map((stat, index) => (
                                    <Fade in={true} timeout={1000 + index * 200} key={stat.label}>
                                        <Box sx={{
                                            textAlign: 'center',
                                            p: 3,
                                            backdropFilter: 'blur(10px)',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: 3,
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            minWidth: 150
                                        }}>
                                            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                                                {stat.value}
                                            </Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, mb: 0.5 }}>
                                                {stat.label}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                                {stat.detail}
                                            </Typography>
                                        </Box>
                                    </Fade>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Fade in={true} timeout={1500}>
                                <Box sx={{ position: 'relative' }}>
                                    {/* Floating decorative elements */}
                                    <Box sx={{
                                        position: 'absolute',
                                        top: -20,
                                        right: -20,
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        zIndex: 1,
                                        animation: `${bounce} 3s ease-in-out infinite`
                                    }} />
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: -30,
                                        left: -30,
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(255,215,0,0.3)',
                                        zIndex: 1,
                                        animation: `${pulse} 2s ease-in-out infinite`
                                    }} />

                                    <Card
                                        sx={{
                                            borderRadius: 6,
                                            overflow: 'hidden',
                                            position: 'relative',
                                            boxShadow: '0 35px 100px rgba(0,0,0,0.4), 0 0 60px rgba(102, 126, 234, 0.2)',
                                            transform: 'rotate(-3deg) scale(1.05)',
                                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                transform: 'rotate(0deg) scale(1.08)',
                                                boxShadow: '0 45px 120px rgba(0,0,0,0.5), 0 0 80px rgba(102, 126, 234, 0.3)'
                                            },
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="450"
                                            image={deliverBoy}
                                            alt="Mesob delivery rider"
                                            sx={{
                                                objectFit: 'cover',
                                                transition: 'transform 0.5s ease',
                                                '&:hover': { transform: 'scale(1.1)' }
                                            }}
                                        />
                                        <CardContent sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            width: '100%',
                                            bgcolor: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                                            color: 'white',
                                            p: 4,
                                            backdropFilter: 'blur(5px)'
                                        }}>
                                            <Typography variant="h5" sx={{
                                                fontWeight: 800,
                                                mb: 2,
                                                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                                fontSize: '1.5rem'
                                            }}>
                                                Fresh & Authentic
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                opacity: 0.95,
                                                lineHeight: 1.6,
                                                fontSize: '1rem'
                                            }}>
                                                Traditional Ethiopian flavors meet modern convenience in every bite
                                            </Typography>
                                            <Box sx={{
                                                mt: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Box sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: '#4CAF50',
                                                    animation: 'pulse 2s infinite'
                                                }} />
                                                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                                    Available Now
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Fade>
                        </Grid>
                    </Grid>
                </Fade>
            </Container>

            {/* Categories Section */}
            <Box sx={{ bgcolor: 'white', py: 8, position: 'relative' }}>
                <Container maxWidth="xl">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="overline"
                            sx={{
                                letterSpacing: 2,
                                color: 'primary.main',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                            }}
                        >
                            DISCOVER FLAVORS
                        </Typography>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                mt: 2,
                                mb: 2,
                                fontSize: { xs: '2rem', md: '2.5rem' }
                            }}
                        >
                            Curated for Every Craving
                        </Typography>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
                        >
                            From traditional Ethiopian dishes to international cuisines,
                            find exactly what you're craving from our curated selection.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 6 }}>
                        {categories.map(({ value, label, icon: Icon }, index) => (
                            <Fade in={true} timeout={1000 + index * 100} key={value}>
                                <Chip
                                    icon={<Icon fontSize="small" />}
                                    label={label}
                                    clickable
                                    onClick={() => setSelectedCategory(value)}
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 2,
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        bgcolor: selectedCategory === value
                                            ? 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                                            : 'rgba(255,255,255,0.8)',
                                        color: selectedCategory === value ? 'white' : 'text.primary',
                                        border: '2px solid',
                                        borderColor: selectedCategory === value ? 'transparent' : 'rgba(0,0,0,0.1)',
                                        boxShadow: selectedCategory === value
                                            ? '0 8px 25px rgba(102, 126, 234, 0.3)'
                                            : '0 4px 15px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                                        }
                                    }}
                                />
                            </Fade>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                        <Chip
                            label="All Cuisines"
                            onClick={() => setCuisineFilter('')}
                            sx={{
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                bgcolor: cuisineFilter === '' ? 'primary.main' : 'grey.100',
                                color: cuisineFilter === '' ? 'white' : 'text.primary',
                                fontWeight: 500,
                                '&:hover': { bgcolor: cuisineFilter === '' ? 'primary.dark' : 'grey.200' }
                            }}
                        />
                        {uniqueCuisines.map((cuisine, index) => (
                            <Fade in={true} timeout={1200 + index * 50} key={cuisine}>
                                <Chip
                                    label={cuisine}
                                    onClick={() => setCuisineFilter(cuisine)}
                                    sx={{
                                        borderRadius: 2,
                                        px: 2,
                                        py: 1,
                                        bgcolor: cuisineFilter === cuisine ? 'primary.main' : 'grey.100',
                                        color: cuisineFilter === cuisine ? 'white' : 'text.primary',
                                        fontWeight: 500,
                                        '&:hover': { bgcolor: cuisineFilter === cuisine ? 'primary.dark' : 'grey.200' }
                                    }}
                                />
                            </Fade>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Featured Restaurants */}
            <Container maxWidth="xl" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography
                        variant="overline"
                        sx={{
                            letterSpacing: 2,
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}
                    >
                        FEATURED RESTAURANTS
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            mt: 2,
                            mb: 2,
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        Chef-Approved Picks
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
                    >
                        Discover the most popular and highly-rated restaurants in Addis Ababa,
                        curated by our expert food critics.
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {featuredRestaurants.length ? (
                            featuredRestaurants.map((restaurant, index) => (
                                <Grid item xs={12} sm={6} md={3} key={restaurant._id || restaurant.id}>
                                    <Slide direction="up" in={true} timeout={1000 + index * 200}>
                                        <Box>
                                            <RestaurantCard restaurant={restaurant} />
                                        </Box>
                                    </Slide>
                                </Grid>
                            ))
                        ) : (
                            <Box sx={{
                                width: '100%',
                                textAlign: 'center',
                                py: 8,
                                bgcolor: 'grey.50',
                                borderRadius: 4
                            }}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                    No restaurants match your filters yet.
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    Try adjusting your search criteria or browse all restaurants.
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                )}
            </Container>

            {/* How It Works Section */}
            <Box sx={{
                bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 10,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.5,
                }} />
                <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="overline"
                                sx={{
                                    color: 'rgba(255,255,255,0.8)',
                                    fontWeight: 600,
                                    letterSpacing: 2,
                                    fontSize: '0.875rem'
                                }}
                            >
                                HOW IT WORKS
                            </Typography>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 800,
                                    mt: 2,
                                    mb: 3,
                                    color: 'white',
                                    fontSize: { xs: '2rem', md: '2.5rem' }
                                }}
                            >
                                From Craving to Couch in Three Simple Steps
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'rgba(255,255,255,0.9)',
                                    lineHeight: 1.6,
                                    fontWeight: 400
                                }}
                            >
                                Experience seamless food delivery with our advanced logistics platform
                                and dedicated rider network ensuring your food arrives fresh and hot.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ position: 'relative' }}>
                                {experienceSteps.map(({ title, description }, index) => (
                                    <Fade in={true} timeout={1200 + index * 300} key={title}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            mb: 4,
                                            p: 3,
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            borderRadius: 3,
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            transition: 'transform 0.3s ease',
                                            '&:hover': { transform: 'translateX(10px)' }
                                        }}>
                                            <Avatar sx={{
                                                bgcolor: 'white',
                                                color: 'primary.main',
                                                fontWeight: 700,
                                                mr: 3,
                                                width: 50,
                                                height: 50,
                                                fontSize: '1.25rem'
                                            }}>
                                                {index + 1}
                                            </Avatar>
                                            <Box>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: 'white',
                                                        mb: 1
                                                    }}
                                                >
                                                    {title}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: 'rgba(255,255,255,0.85)',
                                                        lineHeight: 1.5
                                                    }}
                                                >
                                                    {description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Fade>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
                <Container maxWidth="xl">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="overline"
                            sx={{
                                letterSpacing: 2,
                                color: 'primary.main',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                            }}
                        >
                            WHY CHOOSE MESOB
                        </Typography>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                mt: 2,
                                mb: 3,
                                fontSize: { xs: '2rem', md: '2.5rem' }
                            }}
                        >
                            Always On, Always Reliable
                        </Typography>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6 }}
                        >
                            Join thousands of satisfied customers who trust Mesob for their daily meals.
                            Experience the difference with our premium food delivery service.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {features.map(({ title, description, icon: Icon }, index) => (
                            <Grid item xs={12} md={4} key={title}>
                                <Fade in={true} timeout={1000 + index * 200}>
                                    <Card sx={{
                                        height: '100%',
                                        borderRadius: 4,
                                        p: 4,
                                        bgcolor: 'white',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                                        }
                                    }}>
                                        <Box sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            bgcolor: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 3,
                                            mx: 'auto'
                                        }}>
                                            <Icon sx={{ fontSize: 32, color: 'white' }} />
                                        </Box>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 700,
                                                textAlign: 'center',
                                                mb: 2
                                            }}
                                        >
                                            {title}
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                textAlign: 'center',
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {description}
                                        </Typography>
                                    </Card>
                                </Fade>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Mobile App Section */}
            <Box sx={{
                bgcolor: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                py: 10,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }} />
                <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="overline"
                                sx={{
                                    color: 'rgba(255,255,255,0.8)',
                                    fontWeight: 600,
                                    letterSpacing: 2,
                                    fontSize: '0.875rem'
                                }}
                            >
                                GET THE APP
                            </Typography>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 800,
                                    mt: 2,
                                    mb: 3,
                                    color: 'white',
                                    fontSize: { xs: '2rem', md: '2.5rem' }
                                }}
                            >
                                Mesob on Mobile
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'rgba(255,255,255,0.9)',
                                    lineHeight: 1.6,
                                    mb: 4
                                }}
                            >
                                Download our app for personalized recommendations, real-time tracking,
                                exclusive deals, and the ultimate food ordering experience.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<PhoneIphone />}
                                    sx={{
                                        bgcolor: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                                        color: '#1a1a1a',
                                        fontWeight: 700,
                                        px: 5,
                                        py: 2,
                                        borderRadius: 4,
                                        fontSize: '1.1rem',
                                        boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)',
                                        '&:hover': {
                                            bgcolor: 'linear-gradient(45deg, #FFC107 30%, #FF8F00 90%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 12px 35px rgba(255, 215, 0, 0.4)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Download for iOS
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.4)',
                                        borderWidth: 2,
                                        px: 5,
                                        py: 2,
                                        borderRadius: 4,
                                        fontSize: '1.1rem',
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
                                    Download for Android
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative'
                            }}>
                                <Box sx={{
                                    width: 300,
                                    height: 600,
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    borderRadius: 4,
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                                }}>
                                    <PhoneIphone sx={{ fontSize: 80, color: 'rgba(255,255,255,0.6)' }} />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Testimonials Section */}
            <Container maxWidth="xl" sx={{ py: 10 }}>
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="overline"
                        sx={{
                            letterSpacing: 2,
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}
                    >
                        CUSTOMER LOVE
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            mt: 2,
                            mb: 3,
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        Loved by Diners Across Addis Ababa
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {testimonials.map(({ name, role, quote, rating }, index) => (
                        <Grid item xs={12} md={6} key={name}>
                            <Fade in={true} timeout={1000 + index * 300}>
                                <Card sx={{
                                    borderRadius: 4,
                                    p: 4,
                                    bgcolor: 'white',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                                    height: '100%',
                                    position: 'relative',
                                    '&::before': {
                                        content: '"\\201C"',
                                        position: 'absolute',
                                        top: 20,
                                        left: 30,
                                        fontSize: '4rem',
                                        color: 'primary.main',
                                        opacity: 0.1,
                                        fontFamily: 'serif'
                                    }
                                }}>
                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                sx={{
                                                    color: i < rating ? '#FFD700' : 'grey.300',
                                                    fontSize: 24
                                                }}
                                            />
                                        ))}
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontStyle: 'italic',
                                            lineHeight: 1.6,
                                            mb: 3,
                                            color: 'text.primary',
                                            fontSize: '1.125rem'
                                        }}
                                    >
                                        {quote}
                                    </Typography>
                                    <Divider sx={{ my: 3 }} />
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{
                                            bgcolor: 'primary.main',
                                            mr: 2,
                                            width: 50,
                                            height: 50
                                        }}>
                                            {name.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                {name}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                {role}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Card>
                            </Fade>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Final CTA Section */}
            <Box sx={{
                bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                py: 12,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="50" cy="50" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }} />

                {/* Animated background elements */}
                <Box sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    animation: `${pulse} 4s ease-in-out infinite`
                }} />
                <Box sx={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '10%',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,215,0,0.2)',
                    animation: `${bounce} 5s ease-in-out infinite`
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <Fade in={true} timeout={1000}>
                        <Typography
                            variant="overline"
                            sx={{
                                color: 'rgba(255,255,255,0.9)',
                                fontWeight: 700,
                                letterSpacing: 3,
                                fontSize: '1rem',
                                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                            }}
                        >
                            READY TO GET STARTED
                        </Typography>
                    </Fade>

                    <Fade in={true} timeout={1200}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 900,
                                mt: 4,
                                mb: 4,
                                color: 'white',
                                fontSize: { xs: '3rem', md: '4.5rem' },
                                lineHeight: 1.1,
                                textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                            }}
                        >
                            Make Every Meal
                            <Box component="span" sx={{
                                display: 'block',
                                background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: 'none',
                                fontSize: { xs: '3.5rem', md: '5rem' }
                            }}>
                                Delicious
                            </Box>
                        </Typography>
                    </Fade>

                    <Fade in={true} timeout={1400}>
                        <Typography
                            variant="h5"
                            sx={{
                                color: 'rgba(255,255,255,0.95)',
                                mb: 8,
                                maxWidth: 700,
                                mx: 'auto',
                                lineHeight: 1.7,
                                fontWeight: 400,
                                fontSize: '1.25rem'
                            }}
                        >
                            Join thousands of food lovers in Addis Ababa. Create your free account,
                            save your favorites, and experience the future of food delivery today.
                        </Typography>
                    </Fade>

                    <Fade in={true} timeout={1600}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={4}
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/register')}
                                endIcon={<ArrowForward />}
                                sx={{
                                    bgcolor: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                                    color: '#1a1a1a',
                                    fontWeight: 800,
                                    px: 8,
                                    py: 2.5,
                                    fontSize: '1.2rem',
                                    borderRadius: 4,
                                    boxShadow: '0 12px 35px rgba(255, 215, 0, 0.4)',
                                    border: '3px solid rgba(255,255,255,0.2)',
                                    '&:hover': {
                                        bgcolor: 'linear-gradient(45deg, #FFC107 30%, #FF8F00 90%)',
                                        transform: 'translateY(-3px) scale(1.05)',
                                        boxShadow: '0 20px 50px rgba(255, 215, 0, 0.6)'
                                    },
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                Get Started Free
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/')}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    borderWidth: 3,
                                    px: 8,
                                    py: 2.5,
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    borderRadius: 4,
                                    backdropFilter: 'blur(10px)',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        borderColor: 'white',
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        transform: 'translateY(-3px) scale(1.05)',
                                        boxShadow: '0 15px 40px rgba(255,255,255,0.2)'
                                    },
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                Browse Restaurants
                            </Button>
                        </Stack>
                    </Fade>
                </Container>
            </Box>
        </Box>
    );
};

export default Home;
