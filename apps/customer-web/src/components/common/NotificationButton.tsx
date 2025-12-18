import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Popover, List, ListItem, ListItemText, Typography, Divider, Button, Box } from '@mui/material';
import { Notifications, NotificationsActive } from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';
import { useDarkMode } from '../../context/DarkModeContext';

const NotificationButton: React.FC = () => {
    const { notifications, notificationPermission, requestPermission } = useNotifications();
    const { darkMode } = useDarkMode();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        // Mark all as read when opened
        setUnreadCount(0);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'notification-popover' : undefined;

    // Update unread count when notifications change
    useEffect(() => {
        if (notifications.length > 0) {
            setUnreadCount(notifications.length);
        }
    }, [notifications]);

    const handleRequestPermission = async () => {
        try {
            await requestPermission();
        } catch (error) {
            console.error('Error requesting permission:', error);
        }
    };

    return (
        <>
            <IconButton
                onClick={handleClick}
                sx={{ 
                    color: darkMode ? 'white' : 'text.primary',
                    ml: 1
                }}
            >
                {notificationPermission === 'granted' ? (
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsActive />
                    </Badge>
                ) : (
                    <Badge badgeContent={unreadCount} color="error">
                        <Notifications />
                    </Badge>
                )}
            </IconButton>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    mt: 1,
                    '& .MuiPaper-root': {
                        width: 350,
                        maxWidth: '100vw',
                        bgcolor: darkMode ? '#1a1a2e' : 'white',
                        border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        boxShadow: darkMode 
                            ? '0 20px 60px rgba(0,0,0,0.5)'
                            : '0 20px 60px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ 
                        mb: 2,
                        color: darkMode ? 'white' : 'text.primary'
                    }}>
                        Notifications
                    </Typography>

                    {notificationPermission !== 'granted' ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" sx={{ 
                                mb: 3,
                                color: darkMode ? 'text.secondary' : 'text.secondary'
                            }}>
                                Enable notifications to receive updates about your orders and promotions
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={handleRequestPermission}
                                sx={{ 
                                    borderRadius: 50,
                                    px: 4,
                                    bgcolor: darkMode ? 'primary.main' : 'primary.main',
                                    '&:hover': {
                                        bgcolor: darkMode ? 'primary.dark' : 'primary.dark'
                                    }
                                }}
                            >
                                Enable Notifications
                            </Button>
                        </Box>
                    ) : (
                        <>
                            {notifications.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" sx={{ 
                                        color: darkMode ? 'text.secondary' : 'text.secondary'
                                    }}>
                                        No new notifications
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                                    {notifications.map((notification, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem alignItems="flex-start">
                                                <ListItemText
                                                    primary={notification.notification?.title || 'New Notification'}
                                                    secondary={notification.notification?.body || 'No content'}
                                                    primaryTypographyProps={{ 
                                                        fontWeight: 'bold',
                                                        color: darkMode ? 'white' : 'text.primary'
                                                    }}
                                                    secondaryTypographyProps={{ 
                                                        color: darkMode ? 'text.secondary' : 'text.secondary'
                                                    }}
                                                />
                                            </ListItem>
                                            {index < notifications.length - 1 && (
                                                <Divider sx={{ 
                                                    bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                                                }} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default NotificationButton;