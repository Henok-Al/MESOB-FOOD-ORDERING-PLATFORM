import Order, { IOrder } from '../models/Order';
import { OrderStatus } from '@food-ordering/constants';
import mongoose from 'mongoose';

// Process scheduled orders that are ready for preparation
export const processScheduledOrders = async (): Promise<{ processed: number; orders: IOrder[] }> => {
  const now = new Date();
  const processingWindow = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

  // Find orders scheduled to be prepared within the next 30 minutes
  const scheduledOrders = await Order.find({
    'scheduledDelivery.date': {
      $gte: now,
      $lte: processingWindow,
    },
    status: OrderStatus.PENDING, // Only process pending orders
    paymentStatus: 'paid', // Only process paid orders
  })
    .populate('restaurant', 'name')
    .populate('user', 'firstName lastName phone')
    .sort({ 'scheduledDelivery.date': 1 });

  let processed = 0;
  const processedOrders: IOrder[] = [];

  for (const order of scheduledOrders) {
    try {
      // Update order status to preparing
      order.status = OrderStatus.PREPARING;
      await order.save();
      processed++;
      processedOrders.push(order);
    } catch (error) {
      console.error(`Failed to process scheduled order ${order._id}:`, error);
    }
  }

  return { processed, orders: processedOrders };
};

// Get orders scheduled for a specific date
export const getScheduledOrdersByDate = async (
  date: Date,
  restaurantId?: string
): Promise<IOrder[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const query: any = {
    'scheduledDelivery.date': {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  if (restaurantId) {
    query.restaurant = restaurantId;
  }

  return Order.find(query)
    .populate('restaurant', 'name address')
    .populate('user', 'firstName lastName phone')
    .sort({ 'scheduledDelivery.date': 1 });
};

// Cancel a scheduled order and process refund if needed
export const cancelScheduledOrder = async (
  orderId: string,
  userId: string,
  reason?: string
): Promise<IOrder | null> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  // Verify user owns the order
  if (order.user.toString() !== userId) {
    throw new Error('Not authorized to cancel this order');
  }

  // Check if order can be cancelled (not already delivered or cancelled)
  const nonCancellableStatuses = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];
  if (nonCancellableStatuses.includes(order.status)) {
    throw new Error('Order cannot be cancelled at this stage');
  }

  // Check time-based cancellation rules
  if (order.scheduledDelivery?.date) {
    const scheduledTime = new Date(order.scheduledDelivery.date);
    const now = new Date();
    const hoursUntilDelivery = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Allow free cancellation if more than 2 hours before scheduled time
    if (hoursUntilDelivery < 2) {
      // Apply cancellation fee or partial refund logic here
      console.log('Cancellation fee may apply for orders cancelled within 2 hours');
    }
  }

  order.status = OrderStatus.CANCELLED;
  order.cancellationReason = reason || 'User cancelled';

  await order.save();

  // TODO: Process refund if payment was made
  // if (order.paymentStatus === 'paid') {
  //   await paymentService.refundPayment(order.payment.paymentIntentId);
  // }

  return order;
};

// Reschedule an order
export const rescheduleOrder = async (
  orderId: string,
  userId: string,
  newDate: Date,
  newTimeSlot?: string
): Promise<IOrder | null> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  // Verify user owns the order
  if (order.user.toString() !== userId) {
    throw new Error('Not authorized to reschedule this order');
  }

  // Check if order can be rescheduled
  const nonReschedulableStatuses = [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.PREPARING];
  if (nonReschedulableStatuses.includes(order.status)) {
    throw new Error('Order cannot be rescheduled at this stage');
  }

  // Validate new date is in the future
  const now = new Date();
  if (newDate < now) {
    throw new Error('Cannot schedule order in the past');
  }

  // Update scheduled delivery
  order.scheduledDelivery = {
    date: newDate,
    timeWindow: newTimeSlot || `${newDate.getHours()}:00 - ${newDate.getHours() + 1}:00`,
  };

  await order.save();

  return order;
};

// Get upcoming scheduled orders for a user
export const getUpcomingScheduledOrders = async (
  userId: string
): Promise<IOrder[]> => {
  const now = new Date();

  return Order.find({
    user: userId,
    'scheduledDelivery.date': { $gte: now },
    status: { $in: [OrderStatus.PENDING, 'confirmed'] },
  })
    .populate('restaurant', 'name address phone')
    .sort({ 'scheduledDelivery.date': 1 });
};

export default {
  processScheduledOrders,
  getScheduledOrdersByDate,
  cancelScheduledOrder,
  rescheduleOrder,
  getUpcomingScheduledOrders,
};
