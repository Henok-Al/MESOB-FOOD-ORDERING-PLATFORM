import { Request, Response } from 'express';
import Notification, { NotificationType } from '../models/Notification';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ user: req.user!._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            user: req.user!._id,
            isRead: false,
        });

        res.status(200).json({
            status: 'success',
            data: {
                notifications,
                unreadCount,
            },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user!._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            res.status(404).json({ status: 'fail', message: 'Notification not found' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { notification },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        await Notification.updateMany(
            { user: req.user!._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            status: 'success',
            message: 'All notifications marked as read',
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user!._id,
        });

        if (!notification) {
            res.status(404).json({ status: 'fail', message: 'Notification not found' });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: 'Notification deleted',
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// Helper function to create notification
export const createNotification = async (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
        relatedOrder?: string;
        relatedRestaurant?: string;
        actionUrl?: string;
        imageUrl?: string;
    }
) => {
    try {
        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            ...options,
        });

        // Here you would integrate with Socket.IO to send real-time notification
        const io = (global as any).io;
        if (io) {
            io.to(userId).emit('notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// @desc    Subscribe user to push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
export const subscribeToPushNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fcmToken } = req.body;
        
        if (!fcmToken) {
            res.status(400).json({ status: 'fail', message: 'FCM token is required' });
            return;
        }
        
        // In a real implementation, you would store this token in your database
        // associated with the user's account
        console.log(`User ${req.user!._id} subscribed with FCM token: ${fcmToken}`);
        
        // Here you would typically:
        // 1. Store the FCM token in your database
        // 2. Associate it with the user's account
        // 3. Handle token updates/replacements
        
        res.status(200).json({
            status: 'success',
            message: 'Successfully subscribed to push notifications',
            data: { fcmToken }
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Send test push notification
// @route   POST /api/notifications/test-push
// @access  Private (Admin only)
export const sendTestPushNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, title, body } = req.body;
        
        if (!userId || !title || !body) {
            res.status(400).json({ status: 'fail', message: 'userId, title, and body are required' });
            return;
        }
        
        // In a real implementation, you would:
        // 1. Look up the user's FCM token from your database
        // 2. Use Firebase Admin SDK to send the push notification
        // 3. Handle the response and errors appropriately
        
        console.log(`Sending test push notification to user ${userId}: ${title} - ${body}`);
        
        // Mock response - in reality this would be the Firebase response
        const mockResponse = {
            success: true,
            messageId: 'mock-message-id-' + Date.now(),
            token: 'mock-fcm-token'
        };
        
        res.status(200).json({
            status: 'success',
            message: 'Test push notification sent successfully',
            data: mockResponse
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Send push notification to specific user
// @route   POST /api/notifications/send-push
// @access  Private (Admin only)
export const sendPushNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, notificationData } = req.body;
        
        if (!userId || !notificationData) {
            res.status(400).json({ status: 'fail', message: 'userId and notificationData are required' });
            return;
        }
        
        // In a real implementation:
        // 1. Look up the user's FCM token
        // 2. Send push notification using Firebase Admin SDK
        // 3. Also create an in-app notification for consistency
        
        console.log(`Sending push notification to user ${userId}:`, notificationData);
        
        // Create in-app notification as well
        await createNotification(
            userId,
            NotificationType.SYSTEM,
            notificationData.title,
            notificationData.body,
            {
                actionUrl: notificationData.click_action,
                imageUrl: notificationData.image
            }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Push notification sent and in-app notification created',
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
