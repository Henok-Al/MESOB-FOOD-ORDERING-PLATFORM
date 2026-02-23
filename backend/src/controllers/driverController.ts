import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import User from '../models/User';
import { OrderStatus } from '@food-ordering/constants';
import { createNotification } from './notificationController';
import { NotificationType } from '../models/Notification';

const isDriver = (req: Request) => req.user && req.user.role === 'driver';

// GET /api/driver/orders/available
export const getAvailableOrders = async (req: Request, res: Response) => {
    try {
        if (!isDriver(req)) return res.status(403).json({ message: 'Driver role required' });

        const orders = await Order.find({
            status: { $in: [OrderStatus.READY, OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
            driver: { $exists: false },
        })
            .populate('restaurant', 'name address imageUrl phone')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ status: 'success', data: { orders } });
    } catch (err: any) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// GET /api/driver/orders/active
export const getActiveOrders = async (req: Request, res: Response) => {
    try {
        if (!isDriver(req)) return res.status(403).json({ message: 'Driver role required' });

        const orders = await Order.find({
            driver: req.user!._id,
            status: { $in: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.READY, OrderStatus.PREPARING, OrderStatus.CONFIRMED] },
        })
            .populate('restaurant', 'name address imageUrl phone')
            .populate('user', 'firstName lastName phone');

        res.json({ status: 'success', data: { orders } });
    } catch (err: any) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// PATCH /api/driver/orders/:id/accept
export const acceptOrder = async (req: Request, res: Response) => {
    try {
        if (!isDriver(req)) return res.status(403).json({ message: 'Driver role required' });

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found' });

        if (order.driver) return res.status(400).json({ status: 'fail', message: 'Order already assigned' });

        if (![OrderStatus.READY, OrderStatus.CONFIRMED, OrderStatus.PREPARING].includes(order.status)) {
            return res.status(400).json({ status: 'fail', message: 'Order not ready for pickup' });
        }

        order.driver = req.user!._id as unknown as mongoose.Schema.Types.ObjectId;
        order.status = OrderStatus.OUT_FOR_DELIVERY;
        order.statusHistory.push({
            status: OrderStatus.OUT_FOR_DELIVERY,
            timestamp: new Date(),
            note: 'Driver accepted order',
            updatedBy: req.user!._id,
        } as any);
        order.estimatedDeliveryTime = order.estimatedDeliveryTime || new Date(Date.now() + 35 * 60 * 1000);

        await order.save();

        await createNotification(
            order.user.toString(),
            NotificationType.ORDER_OUT_FOR_DELIVERY,
            'Your order is on the way',
            'A driver picked up your order and is en route.',
            { relatedOrder: order._id.toString() }
        );

        const io = req.app.get('io');
        if (io) {
            io.to(order.user.toString()).emit('orderStatusUpdated', order);
            io.to(`restaurant-${order.restaurant}`).emit('orderUpdated', order);
        }

        res.json({ status: 'success', data: { order } });
    } catch (err: any) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// PATCH /api/driver/orders/:id/status
export const updateOrderStatusByDriver = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        if (!isDriver(req)) return res.status(403).json({ message: 'Driver role required' });

        const allowed = [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED];
        if (!allowed.includes(status)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid status update' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found' });

        if (order.driver?.toString() !== req.user!._id.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Not your order' });
        }

        order.status = status;
        if (status === OrderStatus.DELIVERED) {
            order.actualDeliveryTime = new Date();
        }
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            updatedBy: req.user!._id,
        } as any);

        await order.save();

        await createNotification(
            order.user.toString(),
            status === OrderStatus.DELIVERED ? NotificationType.ORDER_DELIVERED : NotificationType.ORDER_OUT_FOR_DELIVERY,
            status === OrderStatus.DELIVERED ? 'Order delivered' : 'Order on the way',
            status === OrderStatus.DELIVERED ? 'Your order has been delivered.' : 'Your driver is en route.',
            { relatedOrder: order._id.toString() }
        );

        const io = req.app.get('io');
        if (io) {
            io.to(order.user.toString()).emit('orderStatusUpdated', order);
        }

        res.json({ status: 'success', data: { order } });
    } catch (err: any) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// PATCH /api/driver/availability
export const updateAvailability = async (req: Request, res: Response) => {
    try {
        if (!isDriver(req)) return res.status(403).json({ message: 'Driver role required' });

        const { isAvailable, vehicleType, licensePlate, location } = req.body;

        const driver = await User.findById(req.user!._id);
        if (!driver) return res.status(404).json({ status: 'fail', message: 'Driver not found' });

        driver.driverProfile = {
            ...driver.driverProfile,
            isAvailable: isAvailable ?? driver.driverProfile?.isAvailable ?? false,
            vehicleType: vehicleType ?? driver.driverProfile?.vehicleType,
            licensePlate: licensePlate ?? driver.driverProfile?.licensePlate,
            currentLocation: location
                ? { type: 'Point', coordinates: [location.lng, location.lat] }
                : driver.driverProfile?.currentLocation,
            lastActiveAt: new Date(),
        };

        await driver.save();

        res.json({ status: 'success', data: { driver: driver.driverProfile } });
    } catch (err: any) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// GET /api/driver/earnings
export const getEarnings = async (req: Request, res: Response) => {
    try {
        if (!isDriver(req)) return res.status(403).json({ message: 'Driver role required' });

        const delivered = await Order.find({
            driver: req.user!._id,
            status: OrderStatus.DELIVERED,
        }).select('totalAmount tipAmount createdAt');

        const totalEarnings = delivered.reduce((sum, order) => sum + (order.tipAmount || 0), 0);
        const deliveryCount = delivered.length;

        res.json({
            status: 'success',
            data: {
                totalTips: totalEarnings,
                deliveries: deliveryCount,
                recent: delivered.slice(-10),
            },
        });
    } catch (err: any) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};
