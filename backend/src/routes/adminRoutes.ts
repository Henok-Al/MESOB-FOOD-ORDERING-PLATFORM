import express from 'express';
import {
  getAllUsers,
  getUserDetails,
  updateUser,
  suspendUser,
  getAllRestaurants,
  updateRestaurantStatus,
  getAllOrders,
  updateOrderStatus,
  assignDriver,
  getAllDrivers,
  getDashboardStats,
  getAllReviews,
  moderateReview,
} from '../controllers/adminController';
import { protect, requireRole, requirePermission } from '../middleware/auth';
import { Permission } from '../config/permissions';
import { UserRole } from '@food-ordering/constants';

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(requireRole(UserRole.ADMIN));

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', requirePermission(Permission.MANAGE_USERS), getAllUsers);
router.get('/users/:id', requirePermission(Permission.MANAGE_USERS), getUserDetails);
router.patch('/users/:id', requirePermission(Permission.MANAGE_USERS), updateUser);
router.patch('/users/:id/suspend', requirePermission(Permission.MANAGE_USERS), suspendUser);

// Restaurant management
router.get('/restaurants', requirePermission(Permission.MANAGE_RESTAURANTS), getAllRestaurants);
router.patch(
  '/restaurants/:id/status',
  requirePermission(Permission.MANAGE_RESTAURANTS),
  updateRestaurantStatus
);

// Order management
router.get('/orders', requirePermission(Permission.VIEW_ALL_ORDERS), getAllOrders);
router.patch('/orders/:id/status', requirePermission(Permission.MANAGE_ORDERS), updateOrderStatus);
router.patch('/orders/:id/assign-driver', requirePermission(Permission.MANAGE_ORDERS), assignDriver);

// Driver management
router.get('/drivers', requirePermission(Permission.MANAGE_DRIVERS), getAllDrivers);

// Review moderation
router.get('/reviews', requirePermission(Permission.MODERATE_CONTENT), getAllReviews);
router.patch('/reviews/:id/moderate', requirePermission(Permission.MODERATE_CONTENT), moderateReview);

export default router;
