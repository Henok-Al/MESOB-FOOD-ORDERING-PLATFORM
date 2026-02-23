import api from './api';

export interface Driver {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType?: string;
  vehiclePlate?: string;
  rating?: number;
  totalDeliveries?: number;
  isAvailable?: boolean;
}

export interface DriverLocation {
  lat: number;
  lng: number;
  distance?: number;
}

// Get nearby drivers for tracking
export const getNearbyDrivers = async (
  restaurantId: string
): Promise<{
  drivers: Driver[];
  restaurantLocation: DriverLocation;
}> => {
  const response = await api.get(`/tracking/nearby-drivers/${restaurantId}`);
  return response.data.data;
};

// Get driver's current location
export const getDriverLocation = async (
  orderId: string
): Promise<{
  driver: Driver;
  location: DriverLocation;
  estimatedArrival: string;
}> => {
  const response = await api.get(`/tracking/driver-location/${orderId}`);
  return response.data.data;
};

// Update driver's online status
export const updateDriverStatus = async (
  isAvailable: boolean,
  vehicleType?: string,
  licensePlate?: string,
  location?: { lat: number; lng: number }
): Promise<void> => {
  await api.patch('/driver/availability', {
    isAvailable,
    vehicleType,
    licensePlate,
    location,
  });
};

// Get driver's earnings
export const getDriverEarnings = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  totalEarnings: number;
  totalOrders: number;
  breakdown: Array<{
    date: string;
    orders: number;
    earnings: number;
  }>;
}> => {
  const response = await api.get('/driver/earnings', { params });
  return response.data.data;
};

// Get driver's stats
export const getDriverStats = async (): Promise<{
  todayOrders: number;
  todayEarnings: number;
  weekOrders: number;
  weekEarnings: number;
  rating: number;
  totalDeliveries: number;
}> => {
  const response = await api.get('/driver/stats');
  return response.data.data;
};

export default {
  getNearbyDrivers,
  getDriverLocation,
  updateDriverStatus,
  getDriverEarnings,
  getDriverStats,
};
