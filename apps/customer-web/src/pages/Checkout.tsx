import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    TextField,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    Divider,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { clearCart } from '../store/slices/cartSlice';
import api from '../services/api';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cart = useSelector((state: RootState) => state.cart);
    const { user } = useSelector((state: RootState) => state.auth);

    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (cart.items.length === 0) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Your cart is empty
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Go to Home
                </Button>
            </Container>
        );
    }

    const handlePlaceOrder = async () => {
        if (!address) {
            setError('Please provide a delivery address');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const orderData = {
                restaurant: cart.restaurantId,
                items: cart.items.map((item) => ({
                    product: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                totalAmount: cart.total,
                deliveryAddress: address,
                paymentMethod,
            };

            await api.post('/orders', orderData);

            dispatch(clearCart());
            navigate('/orders'); // Redirect to order history (to be implemented)
        } catch (err: any) {
            console.error('Order failed:', err);
            setError(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA', py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                    Checkout
                </Typography>

                <Grid container spacing={4}>
                    {/* Left Side - Delivery & Payment */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Delivery Address
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Enter your full delivery address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                variant="outlined"
                                sx={{ mt: 1 }}
                            />
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Payment Method
                            </Typography>
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                                <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
                            </RadioGroup>
                        </Paper>
                    </Grid>

                    {/* Right Side - Order Summary */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 24 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Order Summary
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                                {cart.items.map((item) => (
                                    <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2">
                                            {item.quantity}x {item.name}
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="text.secondary">Subtotal</Typography>
                                <Typography fontWeight="bold">${cart.total.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography color="text.secondary">Delivery Fee</Typography>
                                <Typography fontWeight="bold">$2.99</Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">Total</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                    ${(cart.total + 2.99).toFixed(2)}
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                sx={{ py: 1.5, fontSize: '1.1rem' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Place Order'}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Checkout;
