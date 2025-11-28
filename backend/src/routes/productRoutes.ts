import express from 'express';
import {
    getProductsByRestaurant,
    createProduct,
} from '../controllers/productController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getProductsByRestaurant)
    .post(protect, authorize('admin', 'restaurant_owner'), createProduct);

export default router;
