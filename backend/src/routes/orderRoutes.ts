import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
} from '../controllers/orderController';
import {
    cancelOrder,
    reorder,
    getOrderTracking,
    updateOrderStatusEnhanced,
} from '../controllers/orderEnhancedController';
import { protect, requirePermission } from '../middleware/auth';
import { Permission } from '../config/permissions';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createOrder);

router.route('/myorders')
    .get(getMyOrders);

router.route('/admin/all')
    .get(requirePermission(Permission.MANAGE_ORDERS), getAllOrders);

router.route('/:id')
    .get(getOrderById);

router.route('/:id/status')
    .patch(requirePermission(Permission.MANAGE_ORDERS), updateOrderStatusEnhanced);

router.route('/:id/cancel')
    .patch(cancelOrder);

router.route('/:id/reorder')
    .post(reorder);

router.route('/:id/tracking')
    .get(getOrderTracking);

export default router;
