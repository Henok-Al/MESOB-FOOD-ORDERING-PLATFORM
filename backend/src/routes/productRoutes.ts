import express from 'express';
import {
    getProductsByRestaurant,
    createProduct,
} from '../controllers/productController';
import { protect, requirePermission, validateOwnership } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getProductsByRestaurant)
    .post(
        protect,
        requirePermission('menu:create'),
        validateOwnership('restaurant'),
        createProduct
    );

export default router;
