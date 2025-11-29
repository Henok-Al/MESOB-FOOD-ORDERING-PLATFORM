import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from '../controllers/notificationController';
import { protect } from '../middleware/auth';

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

export default router;
