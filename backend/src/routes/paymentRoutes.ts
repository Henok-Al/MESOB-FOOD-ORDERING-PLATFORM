import express from 'express';
import {
    createPaymentIntentController,
    confirmPaymentController,
    refundPaymentController,
    getPaymentHistoryController,
    getPaymentByOrderController,
} from '../controllers/paymentController';
import { protect, requirePermission } from '../middleware/auth';
import { Permission } from '../config/permissions';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create payment intent
router.post('/create-intent', requirePermission(Permission.CREATE_ORDER), createPaymentIntentController);

// Confirm payment and create order
router.post('/confirm', requirePermission(Permission.CREATE_ORDER), confirmPaymentController);

// Get payment history for logged in user
router.get('/history', requirePermission(Permission.VIEW_ORDERS), getPaymentHistoryController);

// Get payment by order ID
router.get('/order/:orderId', requirePermission(Permission.VIEW_ORDERS), getPaymentByOrderController);

// Refund payment (admin/restaurant owner only)
router.post('/refund/:paymentIntentId', requirePermission(Permission.UPDATE_ORDER_STATUS), refundPaymentController);

export default router;
