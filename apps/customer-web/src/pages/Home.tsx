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
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>

            {/* Hero Section */}
            <Container maxWidth="xl" sx={{ py: 8 }}>
                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <Typography
                            variant="overline"
                            sx={{
                                letterSpacing: 3,
                                color: 'text.secondary',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                            }}
                        >
                            PREMIUM FOOD DELIVERY
                        </Typography>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 800,
                                mt: 2,
                                lineHeight: 1.1,
                                fontSize: { xs: '2.5rem', md: '4rem' },
                                color: 'text.primary'
                            }}
                        >
                            Ethiopia's Finest
                            <Box component="span" sx={{
                                display: 'block',
                                fontSize: { xs: '2.5rem', md: '4rem' }
                            }}>
                                Delivered Fresh
                            </Box>
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                mt: 3,
                                color: 'text.secondary',
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
                                borderRadius: '4px',
                                background: 'background.paper',
                                border: '1px solid #e0e0e0',
                                boxShadow: 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: 'text.primary'
                                }
                            }}
                        >
                            <IconButton sx={{ p: '14px', color: 'text.primary' }}>
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
                                    borderRadius: '4px',
                                    px: 5,
                                    py: 1.8,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Explore
                            </Button>
                        </Paper>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ mt: 6 }}>
                            {heroStats.map((stat, index) => (
                                <Box sx={{
                                    textAlign: 'center',
                                    p: 3,
                                    background: 'background.paper',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e0e0',
                                    minWidth: 150
                                }} key={stat.label}>
                                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {stat.detail}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Box sx={{ position: 'relative' }}>
                            <Card
                                sx={{
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    border: '1px solid #e0e0e0',
                                    boxShadow: 'none'
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="450"
                                    image={deliverBoy}
                                    alt="Mesob delivery rider"
                                    sx={{
                                        objectFit: 'cover'
                                    }}
                                />
                                <CardContent sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: '100%',
                                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                                    color: 'text.primary',
                                    p: 4,
                                    backdropFilter: 'blur(5px)'
                                }}>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 800,
                                        mb: 2,
                                        textShadow: '0 2px 10px rgba(0,0,0,0.1)',
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
                                        }} />
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Available Now
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* Categories Section */}
            <Box sx={{ bgcolor: 'background.default', py: 8 }}>
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
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                color: 'text.primary'
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
                            <Chip
                                icon={<Icon fontSize="small" />}
                                label={label}
                                clickable
                                onClick={() => setSelectedCategory(value)}
                                sx={{
                                    borderRadius: '4px',
                                    px: 3,
                                    py: 2,
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    bgcolor: selectedCategory === value
                                        ? 'primary.main'
                                        : 'background.paper',
                                    color: selectedCategory === value ? 'white' : 'text.primary',
                                    border: '1px solid',
                                    borderColor: selectedCategory === value ? 'transparent' : '#e0e0e0',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        borderColor: 'text.primary'
                                    }
                                }}
                                key={value}
                            />
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                        <Chip
                            label="All Cuisines"
                            onClick={() => setCuisineFilter('')}
                            sx={{
                                borderRadius: '4px',
                                px: 2,
                                py: 1,
                                bgcolor: cuisineFilter === '' ? 'primary.main' : 'background.paper',
                                color: cuisineFilter === '' ? 'white' : 'text.primary',
                                fontWeight: 500,
                                border: '1px solid #e0e0e0',
                                '&:hover': { 
                                    bgcolor: cuisineFilter === '' ? 'primary.dark' : 'background.paper',
                                    borderColor: 'text.primary'
                                }
                            }}
                        />
                        {uniqueCuisines.map((cuisine, index) => (
                            <Chip
                                label={cuisine}
                                onClick={() => setCuisineFilter(cuisine)}
                                sx={{
                                    borderRadius: '4px',
                                    px: 2,
                                    py: 1,
                                    bgcolor: cuisineFilter === cuisine ? 'primary.main' : 'background.paper',
                                    color: cuisineFilter === cuisine ? 'white' : 'text.primary',
                                    fontWeight: 500,
                                    border: '1px solid #e0e0e0',
                                    '&:hover': { 
                                        bgcolor: cuisineFilter === cuisine ? 'primary.dark' : 'background.paper',
                                        borderColor: 'text.primary'
                                    }
                                }}
                                key={cuisine}
                            />
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Featured Restaurants */}
            <Container maxWidth="xl" sx={{ py: 8 }} id="restaurants">
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
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: 'text.primary'
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
                                    <Box>
                                        <RestaurantCard restaurant={restaurant} />
                                    </Box>
                                </Grid>
                            ))
                        ) : (
                            <Box sx={{
                                width: '100%',
                                textAlign: 'center',
                                py: 8,
                                bgcolor: 'background.paper',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0'
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
                bgcolor: 'background.default',
                py: 10,
            }}>
                <Container maxWidth="xl">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="overline"
                                sx={{
                                    color: 'text.secondary',
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
                                    color: 'text.primary',
                                    fontSize: { xs: '2rem', md: '2.5rem' }
                                }}
                            >
                                From Craving to Couch in Three Simple Steps
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'text.secondary',
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
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        mb: 4,
                                        p: 3,
                                        bgcolor: 'background.paper',
                                        borderRadius: '8px',
                                        border: '1px solid #e0e0e0',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': { transform: 'translateX(10px)' }
                                    }} key={title}>
                                        <Avatar sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
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
                                                    color: 'text.primary',
                                                    mb: 1
                                                }}
                                            >
                                                {title}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: 'text.secondary',
                                                    lineHeight: 1.5
                                                }}
                                            >
                                                {description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ bgcolor: 'background.default', py: 10 }}>
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
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                color: 'text.primary'
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
                                <Card sx={{
                                    height: '100%',
                                    borderRadius: '8px',
                                    p: 4,
                                    bgcolor: 'background.paper',
                                    boxShadow: 'none',
                                    border: '1px solid #e0e0e0',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        borderColor: 'text.primary'
                                    }
                                }}>
                                    <Box sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        bgcolor: 'primary.main',
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
                                            mb: 2,
                                            color: 'text.primary'
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
                            </Grid>
                        ))}
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
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: 'text.primary'
                        }}
                    >
                        Loved by Diners Across Addis Ababa
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {testimonials.map(({ name, role, quote, rating }, index) => (
                        <Grid item xs={12} md={6} key={name}>
                            <Card sx={{
                                borderRadius: '8px',
                                p: 4,
                                bgcolor: 'background.paper',
                                boxShadow: 'none',
                                height: '100%',
                                border: '1px solid #e0e0e0',
                                position: 'relative',
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
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                            {name}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {role}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Final CTA Section */}
            <Box sx={{
                bgcolor: 'background.default',
                py: 12,
            }}>
                <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 700,
                            letterSpacing: 3,
                            fontSize: '1rem'
                        }}
                    >
                        READY TO GET STARTED
                    </Typography>

                    <Typography
                        variant="h1"
                        sx={{
                            fontWeight: 900,
                            mt: 4,
                            mb: 4,
                            color: 'text.primary',
                            fontSize: { xs: '3rem', md: '4.5rem' },
                            lineHeight: 1.1
                        }}
                    >
                        Make Every Meal
                        <Box component="span" sx={{
                            display: 'block',
                            fontSize: { xs: '3.5rem', md: '5rem' }
                        }}>
                            Delicious
                        </Box>
                    </Typography>

                    <Typography
                        variant="h5"
                        sx={{
                            color: 'text.secondary',
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
                                px: 8,
                                py: 2.5,
                                fontSize: '1.2rem',
                                borderRadius: '4px',
                                fontWeight: 800,
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
                                color: 'text.primary',
                                borderColor: '#e0e0e0',
                                borderWidth: 2,
                                px: 8,
                                py: 2.5,
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                borderRadius: '4px',
                                '&:hover': {
                                    borderColor: 'text.primary',
                                    bgcolor: 'background.paper'
                                },
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            Browse Restaurants
                        </Button>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
};

export default Home;
