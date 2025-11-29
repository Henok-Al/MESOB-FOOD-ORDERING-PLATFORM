import express from 'express';
import {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    seedRestaurants,
    updateRestaurantStatus
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

router
    .route('/')
    .get(getRestaurants)
    .post(protect, requirePermission(Permission.CREATE_RESTAURANT), validateBody(createRestaurantSchema), createRestaurant);

router.post('/seed', seedRestaurants);

// New routes for specific restaurant by ID and status update
router.route('/admin/all')
    .get(requirePermission(Permission.VIEW_RESTAURANTS), getAllRestaurants);

router.route('/:id')
    .get(getRestaurantById)
    .patch(requirePermission(Permission.UPDATE_RESTAURANT), validateBody(createRestaurantSchema), updateRestaurant) // Note: using create schema for now, ideally update schema
    .delete(requirePermission(Permission.DELETE_RESTAURANT), deleteRestaurant);

router.route('/:id/status')
    .patch(requirePermission(Permission.UPDATE_RESTAURANT), updateRestaurantStatus);

export default router;
