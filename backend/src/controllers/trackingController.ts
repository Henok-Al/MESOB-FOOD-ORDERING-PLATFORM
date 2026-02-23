import { Request, Response } from 'express';
import DriverLocation from '../models/DriverLocation';
import Order from '../models/Order';

// @desc    Update driver location (called by driver app)
// @route   POST /api/tracking/location
// @access  Private (Driver only)
export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const driverId = (req as any).user._id;
    const { latitude, longitude, heading, speed, accuracy, batteryLevel, orderId } = req.body;

    if (!latitude || !longitude) {
      res.status(400).json({ status: 'fail', message: 'Latitude and longitude are required' });
      return;
    }

    const locationData: any = {
      driver: driverId,
      coordinates: { latitude, longitude },
      isOnline: true,
      lastUpdated: new Date(),
    };

    if (heading !== undefined) locationData.heading = heading;
    if (speed !== undefined) locationData.speed = speed;
    if (accuracy !== undefined) locationData.accuracy = accuracy;
    if (batteryLevel !== undefined) locationData.batteryLevel = batteryLevel;
    if (orderId) locationData.order = orderId;

    // Upsert location (update if exists, create if not)
    const location = await DriverLocation.findOneAndUpdate(
      { driver: driverId },
      locationData,
      { upsert: true, new: true }
    );

    // Emit real-time update via Socket.io if order exists
    if (orderId && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order-${orderId}`).emit('driverLocation', {
        orderId,
        driverId,
        location: {
          latitude,
          longitude,
          heading,
          speed,
        },
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      status: 'success',
      data: { location },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get driver's current location
// @route   GET /api/tracking/driver/:driverId/location
// @access  Private
export const getDriverLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;

    const location = await DriverLocation.findOne({ driver: driverId })
      .populate('driver', 'name phone avatar')
      .populate('order', 'orderNumber status');

    if (!location) {
      res.status(404).json({ status: 'fail', message: 'Driver location not found' });
      return;
    }

    // Check if location is stale (older than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isStale = location.lastUpdated < fiveMinutesAgo;

    res.status(200).json({
      status: 'success',
      data: {
        location,
        isStale,
        lastUpdated: location.lastUpdated,
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get order tracking info with ETA
// @route   GET /api/tracking/order/:orderId
// @access  Private
export const getOrderTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user._id;

    // Get order with driver info
    const order = await Order.findById(orderId)
      .populate('driver', 'name phone avatar')
      .populate('restaurant', 'name address coordinates')
      .populate('user', 'name address');

    if (!order) {
      res.status(404).json({ status: 'fail', message: 'Order not found' });
      return;
    }

    // Check if user is authorized to view this order
    const isAuthorized =
      order.user._id.toString() === userId.toString() ||
      (order.driver && order.driver._id.toString() === userId.toString()) ||
      (req as any).user.role === 'admin';

    if (!isAuthorized) {
      res.status(403).json({ status: 'fail', message: 'Not authorized to view this order' });
      return;
    }

    // Get driver's current location
    const driverLocation = await DriverLocation.findOne({
      driver: order.driver?._id,
      order: orderId,
    });

    // Calculate ETA (simplified - in production would use mapping service)
    let eta: number | null = null;
    let distance: number | null = null;

    if (driverLocation && order.deliveryAddress?.coordinates) {
      const driverCoords = driverLocation.coordinates;
      const destinationCoords = order.deliveryAddress.coordinates;

      // Simple Haversine distance calculation
      const R = 6371; // Earth's radius in km
      const dLat = ((destinationCoords.lat - driverCoords.latitude) * Math.PI) / 180;
      const dLon = ((destinationCoords.lng - driverCoords.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((driverCoords.latitude * Math.PI) / 180) *
          Math.cos((destinationCoords.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c;

      // Estimate ETA based on average speed of 30 km/h
      eta = Math.round((distance / 30) * 60); // in minutes
    }

    res.status(200).json({
      status: 'success',
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
        },
        driver: order.driver,
        restaurant: order.restaurant,
        deliveryAddress: order.deliveryAddress,
        location: driverLocation
          ? {
              latitude: driverLocation.coordinates.latitude,
              longitude: driverLocation.coordinates.longitude,
              heading: driverLocation.heading,
              speed: driverLocation.speed,
              lastUpdated: driverLocation.lastUpdated,
            }
          : null,
        eta: eta ? `${eta} mins` : null,
        distance: distance ? `${distance.toFixed(1)} km` : null,
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get driver's delivery history/route for an order
// @route   GET /api/tracking/order/:orderId/route
// @access  Private
export const getOrderRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    // In a production app, you'd store location history in a separate collection
    // For now, return the current location and order details
    const order = await Order.findById(orderId)
      .populate('driver', 'name')
      .populate('restaurant', 'name address coordinates')
      .select('orderNumber status pickupAddress deliveryAddress');

    if (!order) {
      res.status(404).json({ status: 'fail', message: 'Order not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        order,
        route: {
          from: order.restaurant?.address || order.pickupAddress,
          to: order.deliveryAddress,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Mark driver as offline
// @route   POST /api/tracking/offline
// @access  Private (Driver only)
export const markOffline = async (req: Request, res: Response): Promise<void> => {
  try {
    const driverId = (req as any).user._id;

    await DriverLocation.findOneAndUpdate(
      { driver: driverId },
      { isOnline: false, lastUpdated: new Date() },
      { upsert: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Driver marked as offline',
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get nearby available drivers (for admin/dispatch)
// @route   GET /api/tracking/nearby
// @access  Private (Admin only)
export const getNearbyDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in km

    if (!lat || !lng) {
      res.status(400).json({ status: 'fail', message: 'Latitude and longitude required' });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const searchRadius = parseFloat(radius as string);

    // Simple bounding box query (in production, use MongoDB's geospatial queries)
    const latRange = searchRadius / 111; // 1 degree lat ≈ 111 km
    const lngRange = searchRadius / (111 * Math.cos((latitude * Math.PI) / 180));

    const drivers = await DriverLocation.find({
      'coordinates.latitude': { $gte: latitude - latRange, $lte: latitude + latRange },
      'coordinates.longitude': { $gte: longitude - lngRange, $lte: longitude + lngRange },
      isOnline: true,
      lastUpdated: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Active in last 5 min
    }).populate('driver', 'name phone avatar vehicleInfo');

    res.status(200).json({
      status: 'success',
      results: drivers.length,
      data: { drivers },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
