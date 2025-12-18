import express from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { protect, requirePermission, validateOwnership } from '../middleware/auth';
import { Permission } from '../config/permissions';
import { validateBody } from '../middleware/validationMiddleware';
import { createCategorySchema } from '../validators/validationSchemas';

const router = express.Router({ mergeParams: true });

router.get('/', protect, requirePermission(Permission.VIEW_MENU), listCategories);

router.post(
    '/',
    protect,
    requirePermission(Permission.CREATE_MENU),
    validateOwnership('restaurant'),
    validateBody(createCategorySchema),
    createCategory
);

router.patch(
    '/:id',
    protect,
    requirePermission(Permission.UPDATE_MENU),
    validateOwnership('restaurant'),
    updateCategory
);

router.delete(
    '/:id',
    protect,
    requirePermission(Permission.DELETE_MENU),
    validateOwnership('restaurant'),
    deleteCategory
);

export default router;
