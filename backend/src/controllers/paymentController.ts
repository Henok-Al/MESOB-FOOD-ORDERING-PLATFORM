import { Request, Response } from 'express';
import * as paymentService from '../services/paymentService';
import Order from '../models/Order';

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { amount, currency, metadata } = req.body;

        if (!amount || amount <= 0) {
            res.status(400).json({
                status: 'fail',
                message: 'Amount is required and must be greater than 0',
            });
            return;
        }

        const result = await paymentService.createPaymentIntent({
            amount,
            currency,
            metadata: {
                ...metadata,
                userId: (req as any).user._id.toString(),
            },
        });

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error: any) {
        console.error('Create payment intent error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create payment intent',
            error: error.message,
        });
    }
};

// @desc    Confirm payment and create order
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPaymentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paymentIntentId, orderData } = req.body;
        const userId = (req as any).user._id;

        if (!paymentIntentId) {
            res.status(400).json({
                status: 'fail',
                message: 'Payment intent ID is required',
            });
            return;
        }

        if (!orderData) {
            res.status(400).json({
                status: 'fail',
                message: 'Order data is required',
            });
            return;
        }

        // Verify payment status with Stripe
        const paymentIntent = await paymentService.retrievePaymentIntent(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            res.status(400).json({
                status: 'fail',
                message: 'Payment has not been completed',
            });
            return;
        }

        // Create order
        const order = await Order.create({
            ...orderData,
            user: userId,
            paymentStatus: 'paid',
            payment: {
                paymentIntentId: paymentIntent.id,
                paymentStatus: 'succeeded',
                paymentMethod: paymentIntent.payment_method as string,
                paidAmount: paymentIntent.amount / 100, // Convert from cents
            },
        });

        // Save payment record
        await paymentService.confirmPayment(paymentIntentId, order._id.toString(), userId.toString());

        res.status(201).json({
            status: 'success',
            data: {
                order,
            },
        });
    } catch (error: any) {
        console.error('Confirm payment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to confirm payment and create order',
            error: error.message,
        });
    }
};

// @desc    Refund payment
// @route   POST /api/payments/refund/:paymentIntentId
// @access  Private (Admin/Restaurant Owner)
export const refundPaymentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paymentIntentId } = req.params;
        const { amount } = req.body;

        const refund = await paymentService.refundPayment(paymentIntentId, amount);

        res.status(200).json({
            status: 'success',
            data: {
                refund,
            },
        });
    } catch (error: any) {
        console.error('Refund payment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process refund',
            error: error.message,
        });
    }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;

        const payments = await paymentService.getPaymentHistory(userId.toString());

        res.status(200).json({
            status: 'success',
            results: payments.length,
            data: {
                payments,
            },
        });
    } catch (error: any) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve payment history',
            error: error.message,
        });
    }
};

// @desc    Get payment by order
// @route   GET /api/payments/order/:orderId
// @access  Private
export const getPaymentByOrderController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;

        const payment = await paymentService.getPaymentByOrder(orderId);

        if (!payment) {
            res.status(404).json({
                status: 'fail',
                message: 'Payment not found for this order',
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                payment,
            },
        });
    } catch (error: any) {
        console.error('Get payment by order error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve payment',
            error: error.message,
        });
    }
};
