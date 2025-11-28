import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Chip,
    Grid,
    CircularProgress,
    Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Order {
    _id: string;
    restaurant: {
        name: string;
        imageUrl: string;
    };
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: string;
    createdAt: string;
}

const Orders: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders/myorders');
                setOrders(response.data.data.orders);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'info';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA', py: 4 }}>
            <Container maxWidth="md">
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                    My Orders
                </Typography>

                {orders.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No orders found
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                            Start Ordering
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {orders.map((order) => (
                            <Grid item xs={12} key={order._id}>
                                <Paper sx={{ p: 3, borderRadius: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">
                                                Order #{order._id.slice(-6).toUpperCase()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={order.status.replace('_', ' ').toUpperCase()}
                                            color={getStatusColor(order.status) as any}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        {order.items.map((item, index) => (
                                            <Typography key={index} variant="body2">
                                                {item.quantity}x {item.name}
                                            </Typography>
                                        ))}
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #eee' }}>
                                        <Typography fontWeight="bold">Total</Typography>
                                        <Typography fontWeight="bold" color="primary" variant="h6">
                                            ${order.totalAmount.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default Orders;
