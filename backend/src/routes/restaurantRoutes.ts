import express from 'express';
import {
    getRestaurants,
    createRestaurant,
    seedRestaurants,
} from '../controllers/restaurantController';
import { protect, authorize } from '../middleware/auth';

// Include other resource routers
import productRouter from './productRoutes';

const router = express.Router();

// Re-route into other resource routers
router.use('/:restaurantId/products', productRouter);

router
    .route('/')
    .get(getRestaurants)
    .post(protect, authorize('admin', 'restaurant_owner'), createRestaurant);

router.post('/seed', seedRestaurants);

export default router;
