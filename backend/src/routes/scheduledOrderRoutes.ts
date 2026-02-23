import express from 'express';
import {
  getUpcomingScheduledOrders,
  getScheduledOrdersByDate,
  rescheduleOrder,
  cancelScheduledOrder,
} from '../controllers/scheduledOrderController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// Get upcoming scheduled orders
router.get('/upcoming', getUpcomingScheduledOrders);

// Get scheduled orders by date
router.get('/', getScheduledOrdersByDate);

// Reschedule an order
router.patch('/:id/reschedule', rescheduleOrder);

// Cancel scheduled order
router.patch('/:id/cancel-scheduled', cancelScheduledOrder);

export default router;
