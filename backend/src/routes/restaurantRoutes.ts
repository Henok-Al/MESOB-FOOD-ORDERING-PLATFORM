import express from 'express';
import {
    getRestaurants,
    createRestaurant,
    seedRestaurants,
} from '../controllers/restaurantController';
import { protect, requirePermission } from '../middleware/auth';
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
    .post(protect, requirePermission('restaurant:create'), validateBody(createRestaurantSchema), createRestaurant);

router.post('/seed', seedRestaurants);

export default router;
