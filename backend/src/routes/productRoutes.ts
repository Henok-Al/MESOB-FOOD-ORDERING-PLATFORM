import express from 'express';
import {
    getProductsByRestaurant,
    createProduct,
} from '../controllers/productController';
import { protect, requirePermission, validateOwnership } from '../middleware/auth';
import { validateBody } from '../middleware/validationMiddleware';
import { createProductSchema } from '../validators/validationSchemas';

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getProductsByRestaurant)
    .post(
        protect,
        requirePermission('menu:create'),
        validateOwnership('restaurant'),
        validateBody(createProductSchema),
        createProduct
    );

export default router;
