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
        <Card sx={{ display: 'flex', height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h6" fontWeight="bold">
                        {product.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" component="div" sx={{ mb: 1 }}>
                        ${product.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description}
                    </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pb: 2 }}>
                    {cartItem ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F5F6FA', borderRadius: 50 }}>
                            <IconButton size="small" onClick={handleRemove} color="primary">
                                <Remove fontSize="small" />
                            </IconButton>
                            <Typography sx={{ mx: 1, fontWeight: 'bold' }}>{cartItem.quantity}</Typography>
                            <IconButton size="small" onClick={handleAdd} color="primary">
                                <Add fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <Button variant="contained" size="small" onClick={handleAdd} sx={{ borderRadius: 50 }}>
                            Add to Cart
                        </Button>
                    )}
                </Box>
            </Box>
            <CardMedia
                component="img"
                sx={{ width: 140, objectFit: 'cover' }}
                image={product.image}
                alt={product.name}
            />
        </Card>
    );
};

export default ProductCard;
