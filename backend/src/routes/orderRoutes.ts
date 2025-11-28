import express from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/').post(createOrder);
router.route('/myorders').get(getMyOrders);
router.route('/:id').get(getOrderById);

export default router;
