import express from 'express';
import {
    getProductsByRestaurant,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
} from '../controllers/productController';
import { protect, requirePermission, validateOwnership } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validationMiddleware';
import { createProductSchema, updateProductSchema } from '../validators/validationSchemas';
import { z } from 'zod';

const router = express.Router({ mergeParams: true });

// ID validation schema
const productIdSchema = z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
});

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

router
    .route('/:productId')
    .get(validateParams(productIdSchema), getProductById)
    .put(
        protect,
        requirePermission('menu:update'),
        validateParams(productIdSchema),
        validateBody(updateProductSchema),
        updateProduct
    )
    .delete(
        protect,
        requirePermission('menu:delete'),
        validateParams(productIdSchema),
        deleteProduct
    );

export default router;
