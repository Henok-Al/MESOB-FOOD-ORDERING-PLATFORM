import api from './api';

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'loyalty';
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  loyaltyRewards: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

// Get all notifications for current user
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/api/notifications');
  return response.data.data;
};

// Get unread notification count
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get('/api/notifications/unread-count');
  return response.data.data.count;
};

// Mark notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  await api.patch(`/api/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  await api.patch('/api/notifications/read-all');
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`/api/notifications/${notificationId}`);
};

// Get notification preferences
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await api.get('/api/notifications/preferences');
  return response.data.data;
};

// Update notification preferences
export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const response = await api.patch('/api/notifications/preferences', preferences);
  return response.data.data;
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (
  subscription: PushSubscription
): Promise<void> => {
  await api.post('/api/notifications/push/subscribe', {
    subscription: subscription.toJSON(),
  });
};

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async (): Promise<void> => {
  await api.delete('/api/notifications/push/unsubscribe');
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported in this browser');
  }
  
  const permission = await Notification.requestPermission();
  return permission;
};

// Check if notifications are enabled
export const areNotificationsEnabled = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
};

// Send test notification (for testing purposes)
export const sendTestNotification = async (): Promise<void> => {
  await api.post('/api/notifications/test');
};
