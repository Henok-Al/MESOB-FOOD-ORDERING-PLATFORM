// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
const firebaseConfig = {
    apiKey: "AIzaSyAyb3Spee6C0khbEccUmq07K6KdmPguZLI",
    authDomain: "clone-b54e6.firebaseapp.com",
    projectId: "clone-b54e6",
    storageBucket: "clone-b54e6.appspot.com",
    messagingSenderId: "137641596801",
    appId: "1:137641596801:web:ae66be1e290c7fb972fa80"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/icons/icon-192x192.png',
        data: payload.data
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // Handle the click action
    if (event.notification.data && event.notification.data.url) {
        clients.openWindow(event.notification.data.url);
    } else {
        clients.openWindow('/');
    }
});