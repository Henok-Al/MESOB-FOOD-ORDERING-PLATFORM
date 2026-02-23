import { Request, Response } from 'express';

// Define notification types
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'loyalty';
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

interface NotificationPreferences {
  userId: string;
  orderUpdates: boolean;
  promotions: boolean;
  loyaltyRewards: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

// Mock data - in production, use database
const notifications: Notification[] = [
  {
    id: '1',
    userId: 'user-1',
    title: 'Order Confirmed',
    message: 'Your order #12345 has been confirmed and is being prepared.',
    type: 'order',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-1',
    title: 'Special Offer!',
    message: 'Get 20% off on your next order with code WELCOME20',
    type: 'promotion',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

let notificationPreferences: NotificationPreferences = {
  userId: 'user-1',
  orderUpdates: true,
  promotions: true,
  loyaltyRewards: true,
  pushEnabled: false,
  emailEnabled: true,
};

// Get all notifications for current user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const userNotifications = notifications.filter(n => n.userId === userId);
    res.json({
      success: true,
      data: userNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const unreadCount = notifications.filter(n => n.userId === userId && !n.read).length;
    res.json({
      success: true,
      data: { count: unreadCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = notifications.find(n => n.id === id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    notification.read = true;
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = notifications.findIndex(n => n.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    notifications.splice(index, 1);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const prefs = { ...notificationPreferences, userId };
    res.json({ success: true, data: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch preferences' });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    notificationPreferences = { ...notificationPreferences, ...updates };
    res.json({ 
      success: true, 
      data: { ...notificationPreferences, userId: (req as any).user?.id || 'user-1' } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
};

// Subscribe to push notifications
export const subscribeToPush = async (req: Request, res: Response) => {
  try {
    // In production, save subscription to database
    res.json({ success: true, message: 'Subscribed to push notifications' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to subscribe' });
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (req: Request, res: Response) => {
  try {
    notificationPreferences.pushEnabled = false;
    res.json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
  }
};

// Send test notification
export const sendTestNotification = async (req: Request, res: Response) => {
  try {
    // In production, send actual push notification
    res.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send test notification' });
  }
};

// Create notification (internal helper)
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'order' | 'promotion' | 'system' | 'loyalty',
  data?: Record<string, any>
): Promise<Notification> => {
  const notification: Notification = {
    id: `notif-${Date.now()}`,
    userId,
    title,
    message,
    type,
    read: false,
    data,
    createdAt: new Date().toISOString(),
  };
  notifications.push(notification);
  return notification;
};
