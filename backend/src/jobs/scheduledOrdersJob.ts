import { processScheduledOrders } from '../services/scheduledOrderService';

// Run every 5 minutes to check for scheduled orders that need to be processed
const SCHEDULED_ORDER_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

let intervalId: ReturnType<typeof setInterval> | null = null;

export const startScheduledOrdersJob = (): void => {
  console.log('Starting scheduled orders job...');
  
  // Run immediately on startup
  runScheduledOrdersCheck();
  
  // Then run every 5 minutes
  intervalId = setInterval(runScheduledOrdersCheck, SCHEDULED_ORDER_CHECK_INTERVAL);
};

export const stopScheduledOrdersJob = (): void => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Scheduled orders job stopped');
  }
};

const runScheduledOrdersCheck = async (): Promise<void> => {
  try {
    console.log('Checking for scheduled orders to process...');
    const result = await processScheduledOrders();
    
    if (result.processed > 0) {
      console.log(`Processed ${result.processed} scheduled orders`);
      
      // Send notifications to restaurants about orders ready for preparation
      for (const order of result.orders) {
        console.log(`Order ${order._id} is now being prepared`);
        // TODO: Send notification to restaurant
      }
    } else {
      console.log('No scheduled orders to process');
    }
  } catch (error) {
    console.error('Error processing scheduled orders:', error);
  }
};

// For manual triggering (via API or CLI)
export const manualScheduledOrdersCheck = async (): Promise<{
  processed: number;
  orders: any[];
}> => {
  return processScheduledOrders();
};

export default {
  startScheduledOrdersJob,
  stopScheduledOrdersJob,
  manualScheduledOrdersCheck,
};
