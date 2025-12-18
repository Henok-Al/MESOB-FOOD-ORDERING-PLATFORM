import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseConfig from '../config/firebase';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// Request permission and get token
export const requestNotificationPermission = async () => {
    try {
        console.log('Requesting notification permission...');
        
        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            
            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey: 'YOUR_VAPID_KEY' // Replace with your VAPID key
            });
            
            if (token) {
                console.log('FCM Token:', token);
                return token;
            } else {
                console.log('No registration token available.');
                return null;
            }
        } else {
            console.log('Notification permission denied.');
            return null;
        }
    } catch (error) {
        console.error('Error getting notification permission:', error);
        return null;
    }
};

// Handle foreground messages
export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log('Message received in foreground:', payload);
            resolve(payload);
        });
    });

// Initialize Firebase Cloud Messaging
export const initFirebaseMessaging = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((err) => {
                console.error('Service Worker registration failed:', err);
            });
    }
};

// Send token to backend
export const sendTokenToBackend = async (token: string, userId: string) => {
    try {
        const response = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                fcmToken: token,
            }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to send token to backend');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error sending token to backend:', error);
        throw error;
    }
};