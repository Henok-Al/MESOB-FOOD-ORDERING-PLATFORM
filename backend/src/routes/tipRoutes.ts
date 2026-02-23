import express from 'express';
import { addDriverTip, getDriverEarningsWithTips, updateTip } from '../controllers/tipController';
import { protect, requireRole } from '../middleware/auth';
import { UserRole } from '@food-ordering/constants';

const router = express.Router();

router.use(protect);

// Customer routes
router.post('/orders/:id/tip', addDriverTip);
router.patch('/orders/:id/tip', updateTip);

// Driver routes
router.get('/driver/earnings-with-tips', requireRole(UserRole.DRIVER), getDriverEarningsWithTips);

export default router;
