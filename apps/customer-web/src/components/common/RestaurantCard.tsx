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
    Stack,
    Tooltip,
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
                cursor: 'pointer',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #0f0c0d, #181315)',
                color: '#f7f2e9',
                border: '1px solid rgba(255,255,255,0.04)',
            }}
            onClick={() => navigate(`/restaurant/${restaurant._id || restaurant.id}`)}
        >
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    height="220"
                    image={restaurant.imageUrl}
                    alt={restaurant.name}
                    sx={{ filter: 'saturate(1.08)', opacity: 0.95 }}
                />
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255,250,243,0.9)',
                        borderRadius: 12,
                        boxShadow: '0 8px 18px rgba(31,18,12,0.12)',
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
                        label="Chef pick"
                        size="small"
                        color="secondary"
                        sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            fontWeight: 700,
                            borderRadius: 999,
                            boxShadow: '0 8px 18px rgba(31,18,12,0.12)',
                        }}
                    />
                )}

                {/* Delivery Time */}
                <Chip
                    label={`${restaurant.deliveryTime}`}
                    size="small"
                    sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        bgcolor: 'rgba(255,250,243,0.94)',
                        fontWeight: 700,
                        borderRadius: 999,
                        boxShadow: '0 6px 16px rgba(31,18,12,0.12)',
                    }}
                />

                {/* Open Now Badge */}
                {restaurant.hours && (
                    <Chip
                        label={isOpen ? 'Open now' : 'Closed'}
                        size="small"
                        color={isOpen ? 'success' : 'default'}
                        sx={{
                            position: 'absolute',
                            bottom: 10,
                            left: 10,
                            fontWeight: 700,
                            borderRadius: 999,
                            boxShadow: '0 6px 16px rgba(31,18,12,0.12)',
                        }}
                    />
                )}
            </Box>

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" component="h2" fontWeight={800} noWrap color="inherit">
                            {restaurant.name}
                        </Typography>
                        <Typography variant="body2" color="rgba(247,242,233,0.7)" noWrap>
                            {restaurant.cuisine}
                        </Typography>
                    </Box>
                    <Tooltip title="Average rating">
                        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(193,129,90,0.2)', px: 1, py: 0.3, borderRadius: 999 }}>
                            <Typography variant="body2" fontWeight={800} sx={{ mr: 0.5 }} color="inherit">
                                {restaurant.rating?.toFixed?.(1) || restaurant.rating}
                            </Typography>
                            <Rating value={1} max={1} size="small" readOnly />
                        </Box>
                    </Tooltip>
                </Box>

                <Typography variant="body2" color="rgba(247,242,233,0.72)" sx={{ mb: 1.5, lineHeight: 1.5 }} noWrap>
                    {restaurant.description}
                </Typography>

                {/* Tags */}
                {restaurant.tags && restaurant.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.6, mb: 2, flexWrap: 'wrap' }}>
                        {restaurant.tags.slice(0, 3).map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{
                                    fontSize: '0.72rem',
                                    height: 22,
                                    borderRadius: 999,
                                    borderColor: 'rgba(247,242,233,0.2)',
                                    color: '#f7f2e9',
                                }}
                            />
                        ))}
                        {restaurant.tags.length > 3 && (
                            <Chip
                                label={`+${restaurant.tags.length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.72rem', height: 22, borderRadius: 999, borderColor: 'rgba(31,18,12,0.12)' }}
                            />
                        )}
                    </Box>
                )}

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 'auto', color: 'text.secondary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DeliveryDining sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">{restaurant.minOrder} min</Typography>
                    </Box>
                    <Typography variant="caption" color="text.disabled">•</Typography>
                    <Typography variant="caption" color="text.secondary">ETB {restaurant.deliveryFee || 0} delivery</Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default RestaurantCard;
