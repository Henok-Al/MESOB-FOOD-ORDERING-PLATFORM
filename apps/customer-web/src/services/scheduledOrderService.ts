import api from './api';

export interface ScheduledOrder {
  _id: string;
  restaurant: {
    _id: string;
    name: string;
    address: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  scheduledDelivery: {
    date: string;
    timeWindow: string;
  };
  createdAt: string;
}

// Get upcoming scheduled orders
export const getUpcomingScheduledOrders = async (): Promise<ScheduledOrder[]> => {
  const response = await api.get('/orders/scheduled/upcoming');
  return response.data.data.orders;
};

// Get scheduled orders for a specific date
export const getScheduledOrdersByDate = async (date: string): Promise<ScheduledOrder[]> => {
  const response = await api.get('/orders/scheduled', { params: { date } });
  return response.data.data.orders;
};

// Reschedule an order
export const rescheduleOrder = async (
  orderId: string,
  newDate: Date,
  newTimeSlot?: string
): Promise<ScheduledOrder> => {
  const response = await api.patch(`/orders/${orderId}/reschedule`, {
    date: newDate.toISOString(),
    timeSlot: newTimeSlot,
  });
  return response.data.data.order;
};

// Cancel a scheduled order
export const cancelScheduledOrder = async (
  orderId: string,
  reason?: string
): Promise<void> => {
  await api.patch(`/orders/${orderId}/cancel-scheduled`, { reason });
};

export default {
  getUpcomingScheduledOrders,
  getScheduledOrdersByDate,
  rescheduleOrder,
  cancelScheduledOrder,
};
