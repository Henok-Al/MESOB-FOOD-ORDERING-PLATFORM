import express from 'express';
import { protect, requireRole } from '../middleware/auth';
import { UserRole } from '@food-ordering/constants';
import {
    getAvailableOrders,
    getActiveOrders,
    acceptOrder,
    updateOrderStatusByDriver,
    updateAvailability,
    getEarnings,
} from '../controllers/driverController';

const router = express.Router();

router.use(protect, requireRole(UserRole.DRIVER));

router.get('/orders/available', getAvailableOrders);
router.get('/orders/active', getActiveOrders);
router.patch('/orders/:id/accept', acceptOrder);
router.patch('/orders/:id/status', updateOrderStatusByDriver);
router.patch('/availability', updateAvailability);
router.get('/earnings', getEarnings);

export default router;
