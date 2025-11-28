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
