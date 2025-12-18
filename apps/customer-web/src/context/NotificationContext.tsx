import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { requestNotificationPermission, onMessageListener, initFirebaseMessaging } from '../services/firebaseService';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface NotificationContextType {
    notificationPermission: string | null;
    requestPermission: () => Promise<string | null>;
    fcmToken: string | null;
    notifications: any[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notificationPermission, setNotificationPermission] = useState<string | null>(null);
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const { user } = useSelector((state: RootState) => state.auth);

    // Initialize Firebase messaging when component mounts
    useEffect(() => {
        initFirebaseMessaging();
        
        // Check current notification permission
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    // Listen for foreground messages
    useEffect(() => {
        const unsubscribe = onMessageListener()
            .then((payload: any) => {
                console.log('Foreground message received:', payload);
                setNotifications(prev => [...prev, payload]);
                
                // Show notification
                if (payload.notification) {
                    new Notification(payload.notification.title, {
                        body: payload.notification.body,
                        icon: payload.notification.icon || '/icons/icon-192x192.png'
                    });
                }
            })
            .catch((err: any) => {
                console.error('Failed to listen for messages:', err);
            });

        return () => {
            // Cleanup if needed
        };
    }, []);

    const requestPermission = async () => {
        try {
            const token = await requestNotificationPermission();
            
            if (token) {
                setFcmToken(token);
                setNotificationPermission('granted');
                
                // If user is logged in, send token to backend
                if (user?._id) {
                    // You would call your backend API here to store the token
                    // await sendTokenToBackend(token, user._id);
                    console.log('Token ready to be sent to backend:', token);
                }
            }
            
            return token;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return null;
        }
    };

    return (
        <NotificationContext.Provider value={{ 
            notificationPermission, 
            requestPermission, 
            fcmToken, 
            notifications 
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};