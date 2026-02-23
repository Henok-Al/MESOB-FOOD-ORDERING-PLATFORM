import { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import Order from '../models/Order';

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderAmount, restaurantId } = req.body;
    const userId = (req as any).user._id;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      res.status(404).json({ status: 'fail', message: 'Invalid coupon code' });
      return;
    }

    // Check if active
    if (!coupon.isActive) {
      res.status(400).json({ status: 'fail', message: 'Coupon is not active' });
      return;
    }

    // Check date validity
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      res.status(400).json({ status: 'fail', message: 'Coupon has expired or not yet valid' });
      return;
    }

    // Check usage limit
    if (coupon.usageCount >= coupon.usageLimit) {
      res.status(400).json({ status: 'fail', message: 'Coupon usage limit reached' });
      return;
    }

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      res.status(400).json({
        status: 'fail',
        message: `Minimum order amount of $${coupon.minOrderAmount} required`,
      });
      return;
    }

    // Check restaurant applicability
    if (coupon.applicableRestaurants && coupon.applicableRestaurants.length > 0) {
      const isApplicable = coupon.applicableRestaurants.some(
        (id) => id.toString() === restaurantId
      );
      if (!isApplicable) {
        res.status(400).json({ status: 'fail', message: 'Coupon not valid for this restaurant' });
        return;
      }
    }

    // Check per-user limit
    const userUsageCount = await Order.countDocuments({
      user: userId,
      promoCode: code.toUpperCase(),
    });

    if (userUsageCount >= coupon.perUserLimit) {
      res.status(400).json({
        status: 'fail',
        message: `You have already used this coupon ${coupon.perUserLimit} time(s)`,
      });
      return;
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({
      status: 'success',
      data: {
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discount: Math.round(discount * 100) / 100,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Private (Admin)
export const getAllCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Coupon.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: coupons.length,
      total,
      data: { coupons },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Create coupon (admin)
// @route   POST /api/coupons
// @access  Private (Admin)
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { coupon },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Update coupon (admin)
// @route   PATCH /api/coupons/:id
// @access  Private (Admin)
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      res.status(404).json({ status: 'fail', message: 'Coupon not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { coupon },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Delete coupon (admin)
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      res.status(404).json({ status: 'fail', message: 'Coupon not found' });
      return;
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
