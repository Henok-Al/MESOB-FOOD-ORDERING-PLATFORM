import express from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController';
import { protect, requirePermission } from '../middleware/auth';
import { validateBody } from '../middleware/validationMiddleware';
import { createOrderSchema } from '../validators/validationSchemas';

const router = express.Router();

router.use(protect);

router.route('/').post(requirePermission('order:create'), validateBody(createOrderSchema), createOrder);
router.route('/myorders').get(requirePermission('order:view'), getMyOrders);
router.route('/:id').get(requirePermission('order:view'), getOrderById);

export default router;
