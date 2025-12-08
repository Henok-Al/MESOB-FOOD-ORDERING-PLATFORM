import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Rating,
    IconButton,
} from '@mui/material';
import { FavoriteBorder, DeliveryDining, Star } from '@mui/icons-material';
import { Restaurant } from '@food-ordering/types';

import { useNavigate } from 'react-router-dom';

interface RestaurantCardProps {
    restaurant: Restaurant;
}

// Helper function to check if restaurant is open now
const isRestaurantOpen = (hours?: Restaurant['hours']): boolean => {
    if (!hours || hours.length === 0) return true; // Assume open if no hours set

    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const todayHours = hours.find(h => h.day === currentDay);
    if (!todayHours || todayHours.isClosed) return false;

    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
};

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
    const navigate = useNavigate();
    const isOpen = isRestaurantOpen(restaurant.hours);

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-4px)',
                },
            }}
            onClick={() => navigate(`/restaurant/${restaurant._id || restaurant.id}`)}
        >
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={restaurant.imageUrl}
                    alt={restaurant.name}
                />
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'white',
                        '&:hover': { bgcolor: 'white' },
                    }}
                    size="small"
                >
                    <FavoriteBorder color="error" />
                </IconButton>

                {/* Featured Badge */}
                {restaurant.isFeatured && (
                    <Chip
                        icon={<Star sx={{ fontSize: 16 }} />}
                        label="Featured"
                        size="small"
                        color="warning"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            fontWeight: 600,
                        }}
                    />
                )}

                {/* Delivery Time */}
                <Chip
                    label={`${restaurant.deliveryTime}`}
                    size="small"
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'white',
                        fontWeight: 600,
                    }}
                />

                {/* Open Now Badge */}
                {restaurant.hours && (
                    <Chip
                        label={isOpen ? 'Open Now' : 'Closed'}
                        size="small"
                        color={isOpen ? 'success' : 'default'}
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            fontWeight: 600,
                        }}
                    />
                )}
            </Box>

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" fontWeight="bold" noWrap>
                        {restaurant.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F5F6FA', px: 0.5, borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 0.5 }}>
                            {restaurant.rating}
                        </Typography>
                        <Rating value={1} max={1} size="small" readOnly />
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                    {restaurant.description}
                </Typography>

                {/* Tags */}
                {restaurant.tags && restaurant.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                        {restaurant.tags.slice(0, 3).map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                        ))}
                        {restaurant.tags.length > 3 && (
                            <Chip
                                label={`+${restaurant.tags.length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                        )}
                    </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <DeliveryDining sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">${restaurant.minOrder} min</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">•</Typography>
                    <Typography variant="caption" color="text.secondary">{restaurant.cuisine}</Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default RestaurantCard;

