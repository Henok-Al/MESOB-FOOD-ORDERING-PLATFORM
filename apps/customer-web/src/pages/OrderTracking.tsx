import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Divider,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    CheckCircle,
    Restaurant,
    LocalShipping,
    Home,
    Cancel,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { OrderStatus } from '@food-ordering/constants';
import { io, Socket } from 'socket.io-client';

interface Order {
    _id: string;
    restaurant: {
        name: string;
        imageUrl: string;
        phone: string;
        address: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: OrderStatus;
    statusHistory: Array<{
        status: OrderStatus;
        timestamp: string;
        note?: string;
    }>;
    deliveryAddress: string;
    estimatedDeliveryTime?: string;
    actualDeliveryTime?: string;
    customerNotes?: string;
    createdAt: string;
}

const OrderTracking: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);

    const statusSteps = [
        { status: OrderStatus.PENDING, label: 'Order Placed', icon: <CheckCircle /> },
        { status: OrderStatus.CONFIRMED, label: 'Confirmed', icon: <CheckCircle /> },
        { status: OrderStatus.PREPARING, label: 'Preparing', icon: <Restaurant /> },
        { status: OrderStatus.READY, label: 'Ready', icon: <CheckCircle /> },
        { status: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: <LocalShipping /> },
        { status: OrderStatus.DELIVERED, label: 'Delivered', icon: <Home /> },
    ];

    useEffect(() => {
        fetchOrderTracking();

        // Setup Socket.IO connection
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [orderId]);

    useEffect(() => {
        if (socket && order) {
            // Join user's room
            socket.emit('join', order._id);

            // Listen for order status updates
            socket.on('orderStatusUpdated', (updatedOrder: Order) => {
                setOrder(updatedOrder);
            });

            return () => {
                socket.off('orderStatusUpdated');
            };
        }
    }, [socket, order]);

    const fetchOrderTracking = async () => {
        try {
            const response = await api.get(`/orders/${orderId}/tracking`);
            setOrder(response.data.data.order);
        } catch (error) {
            console.error('Failed to fetch order tracking:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActiveStep = () => {
        if (!order) return 0;
        if (order.status === OrderStatus.CANCELLED) return -1;
        return statusSteps.findIndex(step => step.status === order.status);
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!order) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h5">Order not found</Typography>
            </Container>
        );
    }

    const activeStep = getActiveStep();
    const isCancelled = order.status === OrderStatus.CANCELLED;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA', py: 4 }}>
            <Container maxWidth="md">
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Track Your Order
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Order ID: #{order._id.slice(-8).toUpperCase()}
                </Typography>

                {/* Order Status */}
                <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
                    {isCancelled ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Cancel sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                            <Typography variant="h5" color="error" gutterBottom>
                                Order Cancelled
                            </Typography>
                            <Typography color="text.secondary">
                                This order has been cancelled
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Order Status
                                </Typography>
                                <Chip
                                    label={order.status.replace(/_/g, ' ').toUpperCase()}
                                    color="primary"
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Box>

                            {order.estimatedDeliveryTime && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Estimated Delivery: {formatTime(order.estimatedDeliveryTime)}
                                </Typography>
                            )}

                            <Stepper activeStep={activeStep} orientation="vertical">
                                {statusSteps.map((step, index) => {
                                    const statusEntry = order.statusHistory.find(
                                        h => h.status === step.status
                                    );

                                    return (
                                        <Step key={step.status}>
                                            <StepLabel
                                                StepIconComponent={() => (
                                                    <Box
                                                        sx={{
                                                            color: index <= activeStep ? 'primary.main' : 'grey.400',
                                                        }}
                                                    >
                                                        {step.icon}
                                                    </Box>
                                                )}
                                            >
                                                <Typography fontWeight={index === activeStep ? 'bold' : 'normal'}>
                                                    {step.label}
                                                </Typography>
                                            </StepLabel>
                                            <StepContent>
                                                {statusEntry && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatTime(statusEntry.timestamp)}
                                                        {statusEntry.note && ` - ${statusEntry.note}`}
                                                    </Typography>
                                                )}
                                            </StepContent>
                                        </Step>
                                    );
                                })}
                            </Stepper>
                        </>
                    )}
                </Paper>

                {/* Restaurant Info */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Restaurant Details
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <img
                            src={order.restaurant.imageUrl}
                            alt={order.restaurant.name}
                            style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <Box>
                            <Typography variant="body1" fontWeight="bold">
                                {order.restaurant.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {order.restaurant.phone}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Order Items */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Order Items
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    {order.items.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography>
                                {item.quantity}x {item.name}
                            </Typography>
                            <Typography fontWeight="bold">
                                ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                        </Box>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight="bold">
                            Total
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                            ${order.totalAmount.toFixed(2)}
                        </Typography>
                    </Box>
                </Paper>

                {/* Delivery Address */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Delivery Address
                    </Typography>
                    <Typography color="text.secondary">{order.deliveryAddress}</Typography>
                    {order.customerNotes && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" fontWeight="bold">
                                Notes:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {order.customerNotes}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default OrderTracking;
