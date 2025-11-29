import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { restaurant, items, totalAmount, deliveryAddress, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            res.status(400).json({ status: 'fail', message: 'No order items' });
            return;
        }

        const order = await Order.create({
            user: (req as any).user._id,
            restaurant,
            items,
            totalAmount,
            deliveryAddress,
            paymentMethod,
        });

        res.status(201).json({
            status: 'success',
            data: {
                order,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({ user: (req as any).user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

        if (!order) {
            res.status(404).json({ status: 'fail', message: 'Order not found' });
            return;
        }

        // Make sure user is order owner or admin
        // if (order.user.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') { ... }

        res.status(200).json({
            status: 'success',
            data: {
                order,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// @desc    Get orders by restaurant
// @route   GET /api/restaurants/:restaurantId/orders
// @access  Private (Restaurant Owner/Admin)
export const getOrdersByRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { restaurantId } = req.params;
        const orders = await Order.find({ restaurant: restaurantId })
            .populate('user', 'firstName lastName email')
            .populate('restaurant', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: { orders },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.find()
            .populate('user', 'firstName lastName email')
            .populate('restaurant', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: { orders },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Restaurant Owner/Admin)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName email');

        if (!order) {
            res.status(404).json({ status: 'fail', message: 'Order not found' });
            return;
        }

        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            // Notify the customer
            io.to(order.user.toString()).emit('orderStatusUpdated', order);
            // Notify restaurant dashboard
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
