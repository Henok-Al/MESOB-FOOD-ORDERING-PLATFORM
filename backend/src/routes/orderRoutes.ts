import express from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController';
import { protect, requirePermission } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/').post(requirePermission('order:create'), createOrder);
router.route('/myorders').get(requirePermission('order:view'), getMyOrders);
router.route('/:id').get(requirePermission('order:view'), getOrderById);

export default router;
