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
import { FavoriteBorder, DeliveryDining } from '@mui/icons-material';
import { Restaurant } from '@food-ordering/types';

import { useNavigate } from 'react-router-dom';

interface RestaurantCardProps {
    restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
    const navigate = useNavigate();

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
                <Chip
                    label={`${restaurant.deliveryTime} min`}
                    size="small"
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'white',
                        fontWeight: 600,
                    }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1 }}>
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

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <DeliveryDining sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">${restaurant.minOrder} min</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">•</Typography>
                    <Typography variant="caption" color="text.secondary">Free Delivery</Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default RestaurantCard;
