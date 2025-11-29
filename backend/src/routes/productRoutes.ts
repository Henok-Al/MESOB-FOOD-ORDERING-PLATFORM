import express from 'express';
import {
    getProductsByRestaurant,
    getAdminProductsByRestaurant,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController';
import { protect, requirePermission, validateOwnership } from '../middleware/auth';
import { Permission } from '../config/permissions';
import { validateBody } from '../middleware/validationMiddleware';
import { createProductSchema } from '../validators/validationSchemas';

const router = express.Router({ mergeParams: true });

router.get('/admin/all', protect, requirePermission(Permission.VIEW_MENU), getAdminProductsByRestaurant);

router
    .route('/')
    .get(getProductsByRestaurant)
    .post(
        protect,
        requirePermission(Permission.CREATE_MENU),
        validateOwnership('restaurant'),
        validateBody(createProductSchema),
        createProduct
    );

router
    .route('/:id')
    .patch(
        protect,
        requirePermission(Permission.UPDATE_MENU),
        validateOwnership('product'),
        updateProduct
    )
    .delete(
        protect,
        requirePermission(Permission.DELETE_MENU),
        validateOwnership('product'),
        deleteProduct
    );

export default router;
