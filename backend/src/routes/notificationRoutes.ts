import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    subscribeToPushNotifications,
    sendTestPushNotification,
    sendPushNotification,
} from '../controllers/notificationController';
import { protect, requireRole } from '../middleware/auth';
import { UserRole } from '@food-ordering/constants';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getNotifications);

router.route('/read-all')
    .patch(markAllAsRead);

router.route('/:id/read')
    .patch(markAsRead);

router.route('/:id')
    .delete(deleteNotification);

// Firebase Push Notification Routes
router.route('/subscribe')
    .post(subscribeToPushNotifications);

router.route('/test-push')
    .post(requireRole(UserRole.ADMIN), sendTestPushNotification);

router.route('/send-push')
    .post(requireRole(UserRole.ADMIN), sendPushNotification);

export default router;
