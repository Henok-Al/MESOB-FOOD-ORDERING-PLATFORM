import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
    ORDER_PLACED = 'order_placed',
    ORDER_CONFIRMED = 'order_confirmed',
    ORDER_PREPARING = 'order_preparing',
    ORDER_READY = 'order_ready',
    ORDER_OUT_FOR_DELIVERY = 'order_out_for_delivery',
    ORDER_DELIVERED = 'order_delivered',
    ORDER_CANCELLED = 'order_cancelled',
    PROMOTION = 'promotion',
    NEW_RESTAURANT = 'new_restaurant',
    REVIEW_RESPONSE = 'review_response',
    SYSTEM = 'system',
}

export interface INotification extends Document {
    user: mongoose.Schema.Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    relatedOrder?: mongoose.Schema.Types.ObjectId;
    relatedRestaurant?: mongoose.Schema.Types.ObjectId;
    actionUrl?: string;
    imageUrl?: string;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(NotificationType),
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    relatedOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    relatedRestaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
    },
    actionUrl: String,
    imageUrl: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
