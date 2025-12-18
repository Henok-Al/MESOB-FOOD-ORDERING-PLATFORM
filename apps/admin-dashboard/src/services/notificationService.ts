import api from './api';

export interface Notification {
    _id: string;
    user: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    relatedOrder?: string;
    relatedRestaurant?: string;
    actionUrl?: string;
    imageUrl?: string;
    createdAt: Date;
}

export interface GetNotificationsResponse {
    status: string;
    data: {
        notifications: Notification[];
        unreadCount: number;
    };
}

export const notificationService = {
    // Get user notifications
    getNotifications: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
        const response = await api.get<GetNotificationsResponse>('/notifications');
        return response.data.data;
    },

    // Mark notification as read
    markAsRead: async (notificationId: string): Promise<Notification> => {
        const response = await api.patch(`/notifications/${notificationId}/read`);
        return response.data.data.notification;
    },

    // Mark all notifications as read
    markAllAsRead: async (): Promise<void> => {
        await api.patch('/notifications/read-all');
    },

    // Delete notification
    deleteNotification: async (notificationId: string): Promise<void> => {
        await api.delete(`/notifications/${notificationId}`);
    },

    // Send system notification (admin only)
    sendSystemNotification: async (notificationData: {
        userIds?: string[];
        type: string;
        title: string;
        message: string;
        actionUrl?: string;
        imageUrl?: string;
    }): Promise<void> => {
        await api.post('/notifications/system', notificationData);
    },
};
