import Order from '../models/Order';
import User from '../models/User';
import DriverLocation from '../models/DriverLocation';
import { OrderStatus } from '@food-ordering/constants';

interface DriverLocationData {
  lat: number;
  lng: number;
}

interface DriverWithDistance {
  driver: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    vehicleType?: string;
    vehiclePlate?: string;
  };
  distance: number;
  location: DriverLocationData;
}

// Calculate distance between two points using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Get available drivers near a location
export const getNearbyDrivers = async (
  lat: number,
  lng: number,
  radiusKm: number = 10
): Promise<DriverWithDistance[]> => {
  // Get all active driver locations
  const driverLocations = await DriverLocation.find({
    isOnline: true,
  });

  const driversWithDistance: DriverWithDistance[] = [];

  for (const location of driverLocations) {
    const driverLat = location.coordinates.latitude;
    const driverLng = location.coordinates.longitude;
    const distance = calculateDistance(lat, lng, driverLat, driverLng);

    if (distance <= radiusKm) {
      const driver = await User.findById(location.driver).select(
        'firstName lastName phone'
      );

      if (driver) {
        driversWithDistance.push({
          driver: {
            _id: driver._id.toString(),
            firstName: driver.firstName,
            lastName: driver.lastName,
            phone: driver.phone || '',
          },
          distance,
          location: { lat: driverLat, lng: driverLng },
        });
      }
    }
  }

  // Sort by distance
  return driversWithDistance.sort((a, b) => a.distance - b.distance);
};

// Auto-assign the best driver to an order
export const autoAssignDriver = async (
  orderId: string,
  restaurantLat: number,
  restaurantLng: number
): Promise<{ success: boolean; driverId?: string; message?: string }> => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    // Check if order already has a driver
    if (order.driver) {
      return { success: false, message: 'Order already has a driver assigned' };
    }

    // Get nearby drivers
    const nearbyDrivers = await getNearbyDrivers(restaurantLat, restaurantLng, 10);

    if (nearbyDrivers.length === 0) {
      return { success: false, message: 'No drivers available nearby' };
    }

    // Select the closest driver
    const selectedDriver = nearbyDrivers[0];

    // Assign driver to order
    order.driver = selectedDriver.driver._id as any;
    order.status = OrderStatus.READY;
    await order.save();

    return { success: true, driverId: selectedDriver.driver._id };
  } catch (error) {
    console.error('Auto-assign driver error:', error);
    return { success: false, message: 'Failed to assign driver' };
  }
};

// Update driver location
export const updateDriverLocation = async (
  driverId: string,
  lat: number,
  lng: number
): Promise<void> => {
  await DriverLocation.findOneAndUpdate(
    { driver: driverId },
    {
      driver: driverId,
      lat,
      lng,
      lastUpdated: new Date(),
    },
    { upsert: true }
  );
};

// Get driver earnings summary
export const getDriverEarnings = async (
  driverId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalEarnings: number;
  totalOrders: number;
  totalDistance: number;
  averageRating: number;
  breakdown: Array<{
    date: Date;
    orders: number;
    earnings: number;
  }>;
}> => {
  const orders = await Order.find({
    driver: driverId,
    status: OrderStatus.DELIVERED,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  let totalEarnings = 0;
  let totalDistance = 0;
  const breakdownMap = new Map<string, { orders: number; earnings: number }>();

  for (const order of orders) {
    // Calculate earnings (base fare + tip + delivery fee)
    const deliveryFee = order.deliveryFee || 0;
    const tip = order.driverTip?.amount || 0;
    const orderEarnings = deliveryFee + tip;

    totalEarnings += orderEarnings;

    const dateKey = order.createdAt.toISOString().split('T')[0];
    const existing = breakdownMap.get(dateKey) || { orders: 0, earnings: 0 };
    breakdownMap.set(dateKey, {
      orders: existing.orders + 1,
      earnings: existing.earnings + orderEarnings,
    });
  }

  const breakdown = Array.from(breakdownMap.entries()).map(([date, data]) => ({
    date: new Date(date),
    orders: data.orders,
    earnings: data.earnings,
  }));

  return {
    totalEarnings,
    totalOrders: orders.length,
    totalDistance,
    averageRating: 4.8, // Would come from driver ratings
    breakdown,
  };
};

// Get driver's current stats
export const getDriverStats = async (
  driverId: string
): Promise<{
  todayOrders: number;
  todayEarnings: number;
  weekOrders: number;
  weekEarnings: number;
  rating: number;
  totalDeliveries: number;
}> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Today's stats
  const todayOrders = await Order.countDocuments({
    driver: driverId,
    status: OrderStatus.DELIVERED,
    createdAt: { $gte: today },
  });

  const todayOrderDocs = await Order.find({
    driver: driverId,
    status: OrderStatus.DELIVERED,
    createdAt: { $gte: today },
  });

  const todayEarnings = todayOrderDocs.reduce(
    (sum, order) => sum + (order.deliveryFee || 0) + (order.driverTip?.amount || 0),
    0
  );

  // Week's stats
  const weekOrders = await Order.countDocuments({
    driver: driverId,
    status: OrderStatus.DELIVERED,
    createdAt: { $gte: weekAgo },
  });

  const weekOrderDocs = await Order.find({
    driver: driverId,
    status: OrderStatus.DELIVERED,
    createdAt: { $gte: weekAgo },
  });

  const weekEarnings = weekOrderDocs.reduce(
    (sum, order) => sum + (order.deliveryFee || 0) + (order.driverTip?.amount || 0),
    0
  );

  // Total deliveries
  const totalDeliveries = await Order.countDocuments({
    driver: driverId,
    status: OrderStatus.DELIVERED,
  });

  return {
    todayOrders,
    todayEarnings,
    weekOrders,
    weekEarnings,
    rating: 4.8,
    totalDeliveries,
  };
};

export default {
  calculateDistance,
  getNearbyDrivers,
  autoAssignDriver,
  updateDriverLocation,
  getDriverEarnings,
  getDriverStats,
};
