import express from 'express';
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController';
import { protect, requirePermission } from '../middleware/auth';
import { Permission } from '../config/permissions';

const router = express.Router();

// Validate coupon (all authenticated users)
router.post('/validate', protect, validateCoupon);

// Admin routes
router.get('/', protect, requirePermission(Permission.MANAGE_RESTAURANTS), getAllCoupons);
router.post('/', protect, requirePermission(Permission.MANAGE_RESTAURANTS), createCoupon);
router.patch('/:id', protect, requirePermission(Permission.MANAGE_RESTAURANTS), updateCoupon);
router.delete('/:id', protect, requirePermission(Permission.MANAGE_RESTAURANTS), deleteCoupon);

export default router;
