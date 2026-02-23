import express from 'express';
import {
    updateLocation,
    getDriverLocation,
    getOrderTracking,
    getOrderRoute,
    markOffline,
    getNearbyDrivers,
} from '../controllers/trackingController';
import { protect, requireRole } from '../middleware/auth';
import { UserRole } from '@food-ordering/constants';

const router = express.Router();

// Driver updates their location
router.post('/location', protect, requireRole(UserRole.DRIVER), updateLocation);

// Driver marks themselves offline
router.post('/offline', protect, requireRole(UserRole.DRIVER), markOffline);

// Get driver's current location
router.get('/driver/:driverId/location', protect, getDriverLocation);

// Get order tracking info with ETA
router.get('/order/:orderId', protect, getOrderTracking);

// Get order route
router.get('/order/:orderId/route', protect, getOrderRoute);

// Get nearby available drivers (admin only)
router.get('/nearby', protect, requireRole(UserRole.ADMIN), getNearbyDrivers);

export default router;
