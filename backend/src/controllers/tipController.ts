import { Request, Response } from 'express';
import Order from '../models/Order';
import LoyaltyPoints, { POINTS_RATES } from '../models/LoyaltyPoints';
import { OrderStatus } from '@food-ordering/constants';

// @desc    Add tip to order
// @route   POST /api/orders/:id/tip
// @access  Private
export const addDriverTip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod } = req.body;
    const userId = (req as any).user._id;

    if (!amount || amount <= 0) {
      res.status(400).json({ status: 'fail', message: 'Tip amount must be greater than 0' });
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ status: 'fail', message: 'Order not found' });
      return;
    }

    // Check if user owns the order
    if (order.user.toString() !== userId.toString()) {
      res.status(403).json({ status: 'fail', message: 'Not authorized' });
      return;
    }

    // Can only tip if order has a driver assigned
    if (!order.driver) {
      res.status(400).json({ status: 'fail', message: 'No driver assigned to this order yet' });
      return;
    }

    // Add tip to order
    order.tipAmount = (order.tipAmount || 0) + amount;
    order.totalAmount += amount;
    
    // Save tip info
    (order as any).driverTip = {
      amount,
      paymentMethod: paymentMethod || 'card',
      tippedAt: new Date(),
    };

    await order.save();

    // Award loyalty points for tipping (1 point per $1 tipped)
    let loyalty = await LoyaltyPoints.findOne({ user: userId });
    if (loyalty) {
      await loyalty.addPoints('earned', Math.floor(amount), `Tip for order #${id.toString().slice(-6)}`);
    }

    res.status(200).json({
      status: 'success',
      data: {
        order,
        tipAmount: amount,
        message: `Thank you for tipping $${amount.toFixed(2)}!`,
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get driver's earnings with tips
// @route   GET /api/driver/earnings-with-tips
// @access  Private (Driver)
export const getDriverEarningsWithTips = async (req: Request, res: Response): Promise<void> => {
  try {
    const driverId = (req as any).user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Get all delivered orders for this driver
    const orders = await Order.find({
      driver: driverId,
      status: OrderStatus.DELIVERED,
    });

    const todayOrders = orders.filter(o => o.actualDeliveryTime && new Date(o.actualDeliveryTime) >= today);
    const weekOrders = orders.filter(o => o.actualDeliveryTime && new Date(o.actualDeliveryTime) >= weekAgo);
    const monthOrders = orders.filter(o => o.actualDeliveryTime && new Date(o.actualDeliveryTime) >= monthAgo);

    const calculateEarnings = (orderList: any[]) => {
      return orderList.reduce((acc, order) => {
        // Base delivery fee (assumed $3 per delivery)
        const baseFee = 3;
        // Tip amount
        const tip = order.tipAmount || 0;
        return {
          deliveries: acc.deliveries + 1,
          baseEarnings: acc.baseEarnings + baseFee,
          tips: acc.tips + tip,
          total: acc.total + baseFee + tip,
        };
      }, { deliveries: 0, baseEarnings: 0, tips: 0, total: 0 });
    };

    res.status(200).json({
      status: 'success',
      data: {
        today: calculateEarnings(todayOrders),
        thisWeek: calculateEarnings(weekOrders),
        thisMonth: calculateEarnings(monthOrders),
        allTime: calculateEarnings(orders),
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Update tip amount (before delivery)
// @route   PATCH /api/orders/:id/tip
// @access  Private
export const updateTip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = (req as any).user._id;

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ status: 'fail', message: 'Order not found' });
      return;
    }

    if (order.user.toString() !== userId.toString()) {
      res.status(403).json({ status: 'fail', message: 'Not authorized' });
      return;
    }

    // Can't update tip after delivery
    if (order.status === OrderStatus.DELIVERED) {
      res.status(400).json({ status: 'fail', message: 'Cannot update tip after delivery' });
      return;
    }

    // Adjust total amount
    const oldTip = order.tipAmount || 0;
    order.totalAmount = order.totalAmount - oldTip + amount;
    order.tipAmount = amount;

    await order.save();

    res.status(200).json({
      status: 'success',
      data: { order, tipAmount: amount },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
