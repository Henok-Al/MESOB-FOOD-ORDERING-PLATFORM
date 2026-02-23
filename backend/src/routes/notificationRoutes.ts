import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestNotification,
} from '../controllers/notificationController';

const router = Router();

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Get preferences
router.get('/preferences', getNotificationPreferences);

// Update preferences
router.patch('/preferences', updateNotificationPreferences);

// Push notification routes
router.post('/push/subscribe', subscribeToPush);
router.delete('/push/unsubscribe', unsubscribeFromPush);

// Test notification
router.post('/test', sendTestNotification);

export default router;
