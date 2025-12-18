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
    Dialog,
    DialogContent,
    Alert,
} from '@mui/material';
import {
    Visibility,
    Refresh,
    Cancel as CancelIcon,
    RateReview,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ReviewForm, { ReviewData } from '../components/ReviewForm';
import { OrderStatus } from '@food-ordering/constants';

interface Order {
    _id: string;
    restaurant: {
        _id: string;
        name: string;
        imageUrl: string;
    };
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
}

const Orders: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

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

    const handleTrackOrder = (orderId: string) => {
        navigate(`/orders/${orderId}/track`);
    };

    const handleReorder = async (orderId: string) => {
        try {
            await api.post(`/orders/${orderId}/reorder`);
            setSuccess('Order placed successfully!');
            navigate('/orders');
            fetchOrders();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to reorder');
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        const reason = prompt('Please provide a cancellation reason (optional):');

        try {
            await api.patch(`/orders/${orderId}/cancel`, {
                cancellationReason: reason || 'Customer requested cancellation',
            });
            setSuccess('Order cancelled successfully');
            fetchOrders();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const handleLeaveReview = (order: Order) => {
        setSelectedOrder(order);
        setShowReviewDialog(true);
    };

    const handleSubmitReview = async (reviewData: ReviewData) => {
        setSubmittingReview(true);
        setError('');

        try {
            await api.post('/reviews', reviewData);
            setSuccess('Review submitted successfully!');
            setShowReviewDialog(false);
            setSelectedOrder(null);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.DELIVERED:
                return 'success';
            case OrderStatus.CANCELLED:
                return 'error';
            case OrderStatus.PENDING:
                return 'warning';
            default:
                return 'info';
        }
    };

    const canCancelOrder = (status: OrderStatus) => {
        return status === OrderStatus.PENDING || status === OrderStatus.CONFIRMED;
    };

    const canReview = (status: OrderStatus) => {
        return status === OrderStatus.DELIVERED;
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

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

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
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <img
                                                src={order.restaurant.imageUrl}
                                                alt={order.restaurant.name}
                                                style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }}
                                            />
                                            <Box>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {order.restaurant.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Order #{order._id.slice(-6).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip
                                            label={order.status.replace(/_/g, ' ').toUpperCase()}
                                            color={getStatusColor(order.status) as any}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        {order.items.slice(0, 3).map((item, index) => (
                                            <Typography key={index} variant="body2" color="text.secondary">
                                                {item.quantity}x {item.name}
                                            </Typography>
                                        ))}
                                        {order.items.length > 3 && (
                                            <Typography variant="body2" color="text.secondary">
                                                +{order.items.length - 3} more items
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #eee' }}>
                                        <Typography fontWeight="bold" variant="h6" color="primary">
                                            ${order.totalAmount.toFixed(2)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {order.status !== OrderStatus.CANCELLED && (
                                                <Button
                                                    size="small"
                                                    startIcon={<Visibility />}
                                                    onClick={() => handleTrackOrder(order._id)}
                                                >
                                                    Track
                                                </Button>
                                            )}
                                            <Button
                                                size="small"
                                                startIcon={<Refresh />}
                                                onClick={() => handleReorder(order._id)}
                                            >
                                                Reorder
                                            </Button>
                                            {canCancelOrder(order.status) && (
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    startIcon={<CancelIcon />}
                                                    onClick={() => handleCancelOrder(order._id)}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            {canReview(order.status) && (
                                                <Button
                                                    size="small"
                                                    color="primary"
                                                    startIcon={<RateReview />}
                                                    onClick={() => handleLeaveReview(order)}
                                                >
                                                    Review
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Review Dialog */}
                <Dialog
                    open={showReviewDialog}
                    onClose={() => !submittingReview && setShowReviewDialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogContent>
                        {selectedOrder && (
                            <ReviewForm
                                orderId={selectedOrder._id}
                                restaurantName={selectedOrder.restaurant.name}
                                onSubmit={handleSubmitReview}
                                onCancel={() => setShowReviewDialog(false)}
                                isLoading={submittingReview}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
};

export default Orders;
