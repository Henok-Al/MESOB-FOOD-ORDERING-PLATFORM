import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Button,
    IconButton,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { Product } from '@food-ordering/types';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../store/slices/cartSlice';
import { RootState } from '../../store';

interface ProductCardProps {
    product: Product;
    restaurantId: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, restaurantId }) => {
    const dispatch = useDispatch();
    const cartItem = useSelector((state: RootState) =>
        state.cart.items.find((item) => item._id === product._id)
    );

    const handleAdd = () => {
        dispatch(addToCart({ product, restaurantId }));
    };

    const handleRemove = () => {
        if (product._id) {
            dispatch(removeFromCart(product._id));
        }
    };

    return (
        <Card sx={{ 
            display: 'flex', 
            height: '100%', 
            borderRadius: '8px', 
            boxShadow: 'none',
            border: '1px solid #e0e0e0',
            transition: 'all 0.2s ease',
            '&:hover': { 
                borderColor: 'text.primary',
                transform: 'translateY(-2px)' 
            }
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h6" fontWeight="600" sx={{ color: 'text.primary', mb: 1 }}>
                        {product.name}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ color: 'text.secondary', mb: 1 }}>
                        ${product.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 2, 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden'
                    }}>
                        {product.description}
                    </Typography>
                    {product.category && (
                        <Box sx={{ 
                            display: 'inline-block', 
                            px: 2, 
                            py: 1, 
                            bgcolor: 'background.paper',
                            borderRadius: '4px',
                            fontSize: '0.75rem', 
                            fontWeight: '600', 
                            color: 'text.secondary',
                            mb: 1,
                            border: '1px solid #e0e0e0'
                        }}>
                            {product.category}
                        </Box>
                    )}
                </CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pb: 2 }}>
                    {cartItem ? (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            bgcolor: 'background.paper',
                            borderRadius: '4px',
                            px: 1, 
                            py: 0.5,
                            border: '1px solid #e0e0e0'
                        }}>
                            <IconButton size="small" onClick={handleRemove} sx={{ color: 'text.primary' }}>
                                <Remove fontSize="small" />
                            </IconButton>
                            <Typography sx={{ mx: 1, fontWeight: '600', color: 'text.primary' }}>{cartItem.quantity}</Typography>
                            <IconButton size="small" onClick={handleAdd} sx={{ color: 'text.primary' }}>
                                <Add fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <Button 
                            variant="contained" 
                            size="small" 
                            onClick={handleAdd}
                            sx={{ 
                                borderRadius: '4px', 
                                fontWeight: '600',
                                textTransform: 'none'
                            }}
                        >
                            Add to Cart
                        </Button>
                    )}
                </Box>
            </Box>
            <CardMedia
                component="img"
                sx={{ 
                    width: 140, 
                    height: 140, 
                    objectFit: 'cover', 
                    borderTopRightRadius: '8px', 
                    borderBottomRightRadius: '8px'
                }}
                image={product.image}
                alt={product.name}
            />
        </Card>
    );
};

export default ProductCard;
