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
