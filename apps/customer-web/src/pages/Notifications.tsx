import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Chip,
    Button,
    CircularProgress,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Delete,
    CheckCircle,
    Restaurant,
    LocalOffer,
    Info,
} from '@mui/icons-material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    relatedOrder?: string;
    relatedRestaurant?: string;
    actionUrl?: string;
    imageUrl?: string;
    createdAt: string;
}

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.data.notifications);
            setUnreadCount(response.data.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id);
        }

        if (notification.relatedOrder) {
            navigate(`/orders/${notification.relatedOrder}/track`);
        } else if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const getNotificationIcon = (type: string) => {
        if (type.includes('order')) return <CheckCircle color="primary" />;
        if (type.includes('restaurant')) return <Restaurant color="secondary" />;
        if (type.includes('promotion')) return <LocalOffer color="success" />;
        return <Info color="info" />;
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const minutes = Math.floor(diffInHours * 60);
            return `${minutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            Notifications
                        </Typography>
                        {unreadCount > 0 && (
                            <Chip
                                label={`${unreadCount} unread`}
                                color="primary"
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        )}
                    </Box>
                    {unreadCount > 0 && (
                        <Button onClick={handleMarkAllAsRead} size="small">
                            Mark all as read
                        </Button>
                    )}
                </Box>

                {notifications.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                        <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No notifications yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            We'll notify you when there's something new
                        </Typography>
                    </Paper>
                ) : (
                    <Paper sx={{ borderRadius: 3 }}>
                        <List sx={{ p: 0 }}>
                            {notifications.map((notification, index) => (
                                <React.Fragment key={notification._id}>
                                    <ListItem
                                        sx={{
                                            bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.selected' },
                                        }}
                                        onClick={() => handleNotificationClick(notification)}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification._id);
                                                }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'background.paper' }}>
                                                {getNotificationIcon(notification.type)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={notification.isRead ? 'normal' : 'bold'}
                                                    >
                                                        {notification.title}
                                                    </Typography>
                                                    {!notification.isRead && (
                                                        <Box
                                                            sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                bgcolor: 'primary.main',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {notification.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatTime(notification.createdAt)}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < notifications.length - 1 && <Box sx={{ borderBottom: '1px solid #eee' }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                )}
            </Container>
        </Box>
    );
};

export default Notifications;
