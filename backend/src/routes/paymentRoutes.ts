import express from 'express';
import {
    createPaymentIntentController,
    confirmPaymentController,
    refundPaymentController,
    getPaymentHistoryController,
    getPaymentByOrderController,
} from '../controllers/paymentController';
import { protect, requirePermission } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create payment intent
router.post('/create-intent', requirePermission('order:create'), createPaymentIntentController);

// Confirm payment and create order
router.post('/confirm', requirePermission('order:create'), confirmPaymentController);

// Get payment history for logged in user
router.get('/history', requirePermission('order:view'), getPaymentHistoryController);

// Get payment by order ID
router.get('/order/:orderId', requirePermission('order:view'), getPaymentByOrderController);

// Refund payment (admin/restaurant owner only)
router.post('/refund/:paymentIntentId', requirePermission('order:update_status'), refundPaymentController);

export default router;
