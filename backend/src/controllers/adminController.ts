import { Request, Response } from 'express';
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import Order from '../models/Order';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import Review from '../models/Review';
import { UserRole, OrderStatus } from '@food-ordering/constants';

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Admin only
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: { users },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get user details by ID
// @route   GET /api/admin/users/:id
// @access  Admin only
export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
      return;
    }

    // Get user's orders
    const orders = await Order.find({ user: user._id })
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: { user, recentOrders: orders },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Update user status/role
// @route   PATCH /api/admin/users/:id
// @access  Admin only
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, status, isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, status, isVerified },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Suspend/unsuspend user
// @route   PATCH /api/admin/users/:id/suspend
// @access  Admin only
export const suspendUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { suspended, reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: suspended ? 'suspended' : 'active',
        suspensionReason: suspended ? reason : undefined,
        suspendedAt: suspended ? new Date() : undefined,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: `User ${suspended ? 'suspended' : 'unsuspended'} successfully`,
      data: { user },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get all restaurants with filters
// @route   GET /api/admin/restaurants
// @access  Admin only
export const getAllRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, cuisine, search, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (cuisine) query.cuisine = cuisine;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const restaurants = await Restaurant.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Restaurant.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: restaurants.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: { restaurants },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Approve/reject restaurant
// @route   PATCH /api/admin/restaurants/:id/status
// @access  Admin only
export const updateRestaurantStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, reason } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: status === 'rejected' ? reason : undefined },
      { new: true }
    );

    if (!restaurant) {
      res.status(404).json({ status: 'fail', message: 'Restaurant not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: `Restaurant ${status} successfully`,
      data: { restaurant },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get all orders with filters
// @route   GET /api/admin/orders
// @access  Admin only
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, restaurant, customer, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (restaurant) query.restaurant = restaurant;
    if (customer) query.user = customer;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    // Calculate totals
    const totalRevenue = await Order.aggregate([
      { $match: { status: OrderStatus.DELIVERED, ...query } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.status(200).json({
      status: 'success',
      results: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: {
        orders,
        stats: {
          totalRevenue: totalRevenue[0]?.total || 0,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Update order status (admin override)
// @route   PATCH /api/admin/orders/:id/status
// @access  Admin only
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, reason } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, statusUpdateReason: reason },
      { new: true }
    )
      .populate('user', 'name email')
      .populate('restaurant', 'name');

    if (!order) {
      res.status(404).json({ status: 'fail', message: 'Order not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: `Order status updated to ${status}`,
      data: { order },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Assign driver to order
// @route   PATCH /api/admin/orders/:id/assign-driver
// @access  Admin only
export const assignDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { driver: driverId, status: OrderStatus.CONFIRMED },
      { new: true }
    )
      .populate('user', 'name')
      .populate('restaurant', 'name')
      .populate('driver', 'name phone');

    if (!order) {
      res.status(404).json({ status: 'fail', message: 'Order not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Driver assigned successfully',
      data: { order },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get all drivers
// @route   GET /api/admin/drivers
// @access  Admin only
export const getAllDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query: any = { role: UserRole.DRIVER };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const drivers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get delivery stats for each driver
    const driverStats = await Promise.all(
      drivers.map(async (driver) => {
        const delivered = await Order.countDocuments({
          driver: driver._id,
          status: OrderStatus.DELIVERED,
        });
        const active = await Order.countDocuments({
          driver: driver._id,
          status: { $in: [OrderStatus.CONFIRMED, OrderStatus.OUT_FOR_DELIVERY] },
        });
        return { ...driver.toObject(), stats: { delivered, active } };
      })
    );

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: drivers.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: { drivers: driverStats },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin only
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // User stats
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    // Restaurant stats
    const totalRestaurants = await Restaurant.countDocuments();
    const pendingRestaurants = await Restaurant.countDocuments({ status: 'pending' });

    // Order stats
    const totalOrders = await Order.countDocuments();
    const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } });
    const ordersThisWeek = await Order.countDocuments({ createdAt: { $gte: weekAgo } });

    // Revenue stats
    const revenueToday = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: OrderStatus.DELIVERED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const revenueThisWeek = await Order.aggregate([
      { $match: { createdAt: { $gte: weekAgo }, status: OrderStatus.DELIVERED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const revenueThisMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: monthAgo }, status: OrderStatus.DELIVERED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Status breakdown
    const pendingOrders = await Order.countDocuments({ status: OrderStatus.PENDING });
    const preparingOrders = await Order.countDocuments({ status: OrderStatus.PREPARING });
    const deliveringOrders = await Order.countDocuments({ status: OrderStatus.OUT_FOR_DELIVERY });
    const deliveredOrders = await Order.countDocuments({ status: OrderStatus.DELIVERED });
    const cancelledOrders = await Order.countDocuments({ status: OrderStatus.CANCELLED });

    // Recent activity
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
        },
        restaurants: {
          total: totalRestaurants,
          pending: pendingRestaurants,
        },
        orders: {
          total: totalOrders,
          today: ordersToday,
          thisWeek: ordersThisWeek,
          byStatus: {
            pending: pendingOrders,
            preparing: preparingOrders,
            delivering: deliveringOrders,
            delivered: deliveredOrders,
            cancelled: cancelledOrders,
          },
        },
        revenue: {
          today: revenueToday[0]?.total || 0,
          thisWeek: revenueThisWeek[0]?.total || 0,
          thisMonth: revenueThisMonth[0]?.total || 0,
        },
        recentOrders,
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get all reviews (for moderation)
// @route   GET /api/admin/reviews
// @access  Admin only
export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) query.moderationStatus = status;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: { reviews },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Moderate review (approve/reject)
// @route   PATCH /api/admin/reviews/:id/moderate
// @access  Admin only
export const moderateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, reason } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: status,
        moderationReason: reason,
        moderatedAt: new Date(),
        moderatedBy: (req as any).user._id,
      },
      { new: true }
    );

    if (!review) {
      res.status(404).json({ status: 'fail', message: 'Review not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: `Review ${status}`,
      data: { review },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
