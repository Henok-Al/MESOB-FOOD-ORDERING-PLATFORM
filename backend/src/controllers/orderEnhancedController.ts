import { Request, Response } from 'express';
import Order from '../models/Order';
import { OrderStatus } from '@food-ordering/constants';
import { createNotification } from './notificationController';
import { NotificationType } from '../models/Notification';

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cancellationReason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404).json({ status: 'fail', message: 'Order not found' });
            return;
        }

        // Check if user owns the order
        if (order.user.toString() !== req.user!._id.toString()) {
            res.status(403).json({ status: 'fail', message: 'Not authorized' });
            return;
        }

        // Can only cancel pending or confirmed orders
        if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
            res.status(400).json({
                status: 'fail',
                message: 'Cannot cancel order at this stage',
            });
            return;
        }

        order.status = OrderStatus.CANCELLED;
        order.cancellationReason = cancellationReason;
        await order.save();

        // Create notification
        await createNotification(
            order.user.toString(),
            NotificationType.ORDER_CANCELLED,
            'Order Cancelled',
            `Your order #${order._id.toString().slice(-6)} has been cancelled`,
            { relatedOrder: order._id.toString() }
        );

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(order.user.toString()).emit('orderStatusUpdated', order);
            io.to(`restaurant-${order.restaurant}`).emit('orderCancelled', order);
        }

        res.status(200).json({
            status: 'success',
            data: { order },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Reorder (create new order from existing order)
// @route   POST /api/orders/:id/reorder
// @access  Private
export const reorder = async (req: Request, res: Response): Promise<void> => {
    try {
        const originalOrder = await Order.findById(req.params.id);

        if (!originalOrder) {
            res.status(404).json({ status: 'fail', message: 'Order not found' });
            return;
        }

        if (originalOrder.user.toString() !== req.user!._id.toString()) {
            res.status(403).json({ status: 'fail', message: 'Not authorized' });
            return;
        }

        const { deliveryAddress } = req.body;

        const newOrder = await Order.create({
            user: req.user!._id,
            restaurant: originalOrder.restaurant,
            items: originalOrder.items,
            totalAmount: originalOrder.totalAmount,
            deliveryAddress: deliveryAddress || originalOrder.deliveryAddress,
            paymentMethod: originalOrder.paymentMethod,
        });

        res.status(201).json({
            status: 'success',
            data: { order: newOrder },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get order tracking details
// @route   GET /api/orders/:id/tracking
// @access  Private
export const getOrderTracking = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('restaurant', 'name imageUrl phone address')
            .populate('user', 'firstName lastName phone');

        if (!order) {
            res.status(404).json({ status: 'fail', message: 'Order not found' });
            return;
        }

        // Check authorization
        if (
            order.user._id.toString() !== req.user!._id.toString() &&
            req.user!.role !== 'admin'
        ) {
            res.status(403).json({ status: 'fail', message: 'Not authorized' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                order,
                statusHistory: order.statusHistory,
                estimatedDeliveryTime: order.estimatedDeliveryTime,
            },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Update order status with notification
// @route   PATCH /api/orders/:id/status
// @access  Private (Restaurant Owner/Admin)
export const updateOrderStatusEnhanced = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404).json({ status: 'fail', message: 'Order not found' });
            return;
        }

        order.status = status;

        // Add to status history with note
        if (note) {
            order.statusHistory.push({
                status,
                timestamp: new Date(),
                note,
                updatedBy: req.user!._id,
            } as any);
        }

        // Set estimated delivery time for confirmed orders
        if (status === OrderStatus.CONFIRMED && !order.estimatedDeliveryTime) {
            order.estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000); // 45 minutes
        }

        // Set actual delivery time for delivered orders
        if (status === OrderStatus.DELIVERED) {
            order.actualDeliveryTime = new Date();
        }

        await order.save();

        // Create notification based on status
        const notificationMap: Record<OrderStatus, { type: NotificationType; title: string; message: string }> = {
            [OrderStatus.PENDING]: {
                type: NotificationType.ORDER_PLACED,
                title: 'Order Placed',
                message: 'Your order has been placed successfully',
            },
            [OrderStatus.CONFIRMED]: {
                type: NotificationType.ORDER_CONFIRMED,
                title: 'Order Confirmed',
                message: 'Your order has been confirmed by the restaurant',
            },
            [OrderStatus.PREPARING]: {
                type: NotificationType.ORDER_PREPARING,
                title: 'Preparing Your Order',
                message: 'The restaurant is preparing your order',
            },
            [OrderStatus.READY]: {
                type: NotificationType.ORDER_READY,
                title: 'Order Ready',
                message: 'Your order is ready for pickup/delivery',
            },
            [OrderStatus.OUT_FOR_DELIVERY]: {
                type: NotificationType.ORDER_OUT_FOR_DELIVERY,
                title: 'Out for Delivery',
                message: 'Your order is on its way!',
            },
            [OrderStatus.DELIVERED]: {
                type: NotificationType.ORDER_DELIVERED,
                title: 'Order Delivered',
                message: 'Your order has been delivered. Enjoy your meal!',
            },
            [OrderStatus.CANCELLED]: {
                type: NotificationType.ORDER_CANCELLED,
                title: 'Order Cancelled',
                message: 'Your order has been cancelled',
            },
        };

        const notificationData = notificationMap[status];
        if (notificationData) {
            await createNotification(
                order.user.toString(),
                notificationData.type,
                notificationData.title,
                notificationData.message,
                { relatedOrder: order._id.toString() }
            );
        }

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(order.user.toString()).emit('orderStatusUpdated', order);
            io.to(`restaurant-${order.restaurant}`).emit('orderUpdated', order);
        }

        res.status(200).json({
            status: 'success',
            data: { order },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
