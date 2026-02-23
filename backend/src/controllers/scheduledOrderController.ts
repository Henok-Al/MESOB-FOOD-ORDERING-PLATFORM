import { Request, Response } from 'express';
import Order from '../models/Order';
import { OrderStatus } from '@food-ordering/constants';
import {
  getUpcomingScheduledOrders as getUpcomingScheduledOrdersService,
  getScheduledOrdersByDate as getScheduledOrdersByDateService,
  rescheduleOrder as rescheduleOrderService,
  cancelScheduledOrder as cancelScheduledOrderService,
} from '../services/scheduledOrderService';

// GET /api/orders/scheduled/upcoming
export const getUpcomingScheduledOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    const orders = await getUpcomingScheduledOrdersService(userId.toString());

    res.status(200).json({
      status: 'success',
      data: { orders },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// GET /api/orders/scheduled
export const getScheduledOrdersByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { date } = req.query;

    if (!date) {
      res.status(400).json({ status: 'fail', message: 'Date is required' });
      return;
    }

    const orders = await getScheduledOrdersByDateService(
      new Date(date as string),
      undefined // restaurantId - only for admin
    );

    // Filter to only show user's orders
    const userOrders = orders.filter(order => order.user.toString() === userId.toString());

    res.status(200).json({
      status: 'success',
      data: { orders: userOrders },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// PATCH /api/orders/:id/reschedule
export const rescheduleOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;
    const { date, timeSlot } = req.body;

    if (!date) {
      res.status(400).json({ status: 'fail', message: 'New date is required' });
      return;
    }

    const order = await rescheduleOrderService(
      id,
      userId.toString(),
      new Date(date),
      timeSlot
    );

    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// PATCH /api/orders/:id/cancel-scheduled
export const cancelScheduledOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await cancelScheduledOrderService(id, userId.toString(), reason);

    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
