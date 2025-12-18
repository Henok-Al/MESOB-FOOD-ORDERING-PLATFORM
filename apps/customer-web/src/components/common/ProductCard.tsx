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
        <Card sx={{ display: 'flex', height: '100%', borderRadius: 4, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(0,0,0,0.12)' } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h6" fontWeight="bold" sx={{ color: 'primary.main' }}>
                        {product.name}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'secondary.main', mb: 1 }}>
                        ${product.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description}
                    </Typography>
                    {product.category && (
                        <Box sx={{ display: 'inline-block', px: 2, py: 1, bgcolor: 'primary.50', borderRadius: 2, fontSize: '0.75rem', fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                            {product.category}
                        </Box>
                    )}
                </CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pb: 2 }}>
                    {cartItem ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'primary.50', borderRadius: 50, px: 1, py: 0.5 }}>
                            <IconButton size="small" onClick={handleRemove} sx={{ color: 'primary.main' }}>
                                <Remove fontSize="small" />
                            </IconButton>
                            <Typography sx={{ mx: 1, fontWeight: 'bold', color: 'primary.main' }}>{cartItem.quantity}</Typography>
                            <IconButton size="small" onClick={handleAdd} sx={{ color: 'primary.main' }}>
                                <Add fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <Button variant="contained" size="small" onClick={handleAdd} sx={{ borderRadius: 50, fontWeight: 'bold' }}>
                            Add to Cart
                        </Button>
                    )}
                </Box>
            </Box>
            <CardMedia
                component="img"
                sx={{ width: 140, height: 140, objectFit: 'cover', borderTopRightRadius: 12, borderBottomRightRadius: 12 }}
                image={product.image}
                alt={product.name}
            />
        </Card>
    );
};

export default ProductCard;
