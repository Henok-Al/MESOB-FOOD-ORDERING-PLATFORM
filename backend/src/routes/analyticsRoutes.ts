import express from 'express';
import {
    getAdminDashboard,
    getRestaurantAnalytics,
    getRevenueReport,
    getRestaurantOwnerDashboard,
} from '../controllers/analyticsController';
import { protect, requirePermission } from '../middleware/auth';
import { Permission } from '../config/permissions';

const router = express.Router();

router.use(protect);

router.route('/admin/dashboard')
    .get(requirePermission(Permission.MANAGE_ORDERS), getAdminDashboard);

router.route('/restaurant/dashboard')
    .get(getRestaurantOwnerDashboard);


router.route('/restaurant/:restaurantId')
    .get(getRestaurantAnalytics);

router.route('/revenue')
    .get(requirePermission(Permission.MANAGE_ORDERS), getRevenueReport);

export default router;
