import express from 'express';
import {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    seedRestaurants,
    updateRestaurantStatus,
    getMyRestaurant,
    getFeaturedRestaurants,
    incrementViewCount,
    updateRestaurantHours,
    getRestaurantAnalytics,
} from '../controllers/restaurantController';
import { protect, requirePermission } from '../middleware/auth';
import { Permission } from '../config/permissions';
import { validateBody } from '../middleware/validationMiddleware';
import { createRestaurantSchema } from '../validators/validationSchemas';

// Include other resource routers
import productRouter from './productRoutes';

const router = express.Router();

// Re-route into other resource routers
router.use('/:restaurantId/products', productRouter);

// Public routes
router.get('/featured', getFeaturedRestaurants);
router.post('/seed', seedRestaurants);

// Get current user's restaurant
router.get('/me', requirePermission(Permission.VIEW_RESTAURANT), getMyRestaurant);

// Admin-only route to get all restaurants (including inactive)
router
    .route('/admin/all')
    .get(requirePermission(Permission.VIEW_RESTAURANT), getAllRestaurants);

router
    .route('/')
    .get(getAllRestaurants)
    .post(requirePermission(Permission.CREATE_RESTAURANT), createRestaurant);

router.route('/:id')
    .get(getRestaurantById)
    .patch(requirePermission(Permission.UPDATE_RESTAURANT), validateBody(createRestaurantSchema), updateRestaurant)
    .delete(requirePermission(Permission.DELETE_RESTAURANT), deleteRestaurant);

router.route('/:id/status')
    .patch(requirePermission(Permission.UPDATE_RESTAURANT), updateRestaurantStatus);

// New routes
router.post('/:id/view', incrementViewCount);

router.patch('/:id/hours', requirePermission(Permission.UPDATE_RESTAURANT), updateRestaurantHours);

router.get('/:id/analytics', requirePermission(Permission.VIEW_RESTAURANT), getRestaurantAnalytics);

export default router;

