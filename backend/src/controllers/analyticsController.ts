import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import Review from '../models/Review';
import { OrderStatus } from '@food-ordering/constants';

// @desc    Get admin dashboard metrics
// @route   GET /api/analytics/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string),
            };
        }

        // Total counts
        const totalUsers = await User.countDocuments();
        const totalRestaurants = await Restaurant.countDocuments();
        const totalOrders = await Order.countDocuments(dateFilter);

        // Revenue
        const revenueData = await Order.aggregate([
            { $match: { status: OrderStatus.DELIVERED, ...dateFilter } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' },
                },
            },
        ]);

        const revenue = revenueData[0] || { totalRevenue: 0, averageOrderValue: 0 };

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Daily revenue trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyRevenue = await Order.aggregate([
            {
                $match: {
                    status: OrderStatus.DELIVERED,
                    createdAt: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Top restaurants by revenue
        const topRestaurants = await Order.aggregate([
            { $match: { status: OrderStatus.DELIVERED, ...dateFilter } },
            {
                $group: {
                    _id: '$restaurant',
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'restaurant',
                },
            },
            { $unwind: '$restaurant' },
            {
                $project: {
                    name: '$restaurant.name',
                    revenue: 1,
                    orders: 1,
                },
            },
        ]);

        // Recent orders
        const recentOrders = await Order.find(dateFilter)
            .populate('user', 'firstName lastName')
            .populate('restaurant', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            status: 'success',
            data: {
                overview: {
                    totalUsers,
                    totalRestaurants,
                    totalOrders,
                    totalRevenue: revenue.totalRevenue,
                    averageOrderValue: revenue.averageOrderValue,
                },
                ordersByStatus,
                dailyRevenue,
                topRestaurants,
                recentOrders,
            },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get restaurant analytics
// @route   GET /api/analytics/restaurant/:restaurantId
// @access  Private (Restaurant Owner/Admin)
export const getRestaurantAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { restaurantId } = req.params;
        const { startDate, endDate } = req.query;

        const dateFilter: any = { restaurant: restaurantId };
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string),
            };
        }

        // Total orders and revenue
        const orderStats = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [{ $eq: ['$status', OrderStatus.DELIVERED] }, '$totalAmount', 0],
                        },
                    },
                    averageOrderValue: { $avg: '$totalAmount' },
                },
            },
        ]);

        const stats = orderStats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $match: { restaurant: restaurantId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Popular menu items
        const popularItems = await Order.aggregate([
            { $match: { restaurant: restaurantId, status: OrderStatus.DELIVERED } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    totalOrdered: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                },
            },
            { $sort: { totalOrdered: -1 } },
            { $limit: 10 },
        ]);

        // Average ratings
        const reviewStats = await Review.aggregate([
            { $match: { restaurant: restaurantId } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    averageFoodRating: { $avg: '$foodRating' },
                    averageServiceRating: { $avg: '$serviceRating' },
                    averageDeliveryRating: { $avg: '$deliveryRating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        const ratings = reviewStats[0] || {
            averageRating: 0,
            averageFoodRating: 0,
            averageServiceRating: 0,
            averageDeliveryRating: 0,
            totalReviews: 0,
        };

        // Daily orders trend (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyOrders = await Order.aggregate([
            {
                $match: {
                    restaurant: restaurantId,
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    orders: { $sum: 1 },
                    revenue: {
                        $sum: {
                            $cond: [{ $eq: ['$status', OrderStatus.DELIVERED] }, '$totalAmount', 0],
                        },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                overview: stats,
                ordersByStatus,
                popularItems,
                ratings,
                dailyOrders,
            },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get restaurant owner dashboard metrics
// @route   GET /api/analytics/restaurant/dashboard
// @access  Private (Restaurant Owner)
export const getRestaurantOwnerDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const { startDate, endDate } = req.query;

        // Find restaurant owned by this user
        const restaurant = await Restaurant.findOne({ owner: userId });

        if (!restaurant) {
            res.status(404).json({
                status: 'fail',
                message: 'No restaurant found for this user. Please contact support to link your account to a restaurant.',
            });
            return;
        }

        const dateFilter: any = { restaurant: restaurant._id };
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string),
            };
        }

        // Total orders and revenue
        const orderStats = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [{ $eq: ['$status', OrderStatus.DELIVERED] }, '$totalAmount', 0],
                        },
                    },
                    averageOrderValue: { $avg: '$totalAmount' },
                },
            },
        ]);

        const stats = orderStats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $match: { restaurant: restaurant._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Daily revenue trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyRevenue = await Order.aggregate([
            {
                $match: {
                    restaurant: restaurant._id,
                    status: OrderStatus.DELIVERED,
                    createdAt: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Popular menu items
        const popularItems = await Order.aggregate([
            { $match: { restaurant: restaurant._id, status: OrderStatus.DELIVERED } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    totalOrdered: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                },
            },
            { $sort: { totalOrdered: -1 } },
            { $limit: 5 },
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                overview: {
                    totalOrders: stats.totalOrders,
                    totalRevenue: stats.totalRevenue,
                    averageOrderValue: stats.averageOrderValue,
                    restaurantName: restaurant.name,
                },
                ordersByStatus,
                dailyRevenue,
                popularItems,
            },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get revenue report
// @route   GET /api/analytics/revenue
// @access  Private (Admin)
export const getRevenueReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const dateFilter: any = { status: OrderStatus.DELIVERED };
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string),
            };
        }

        let dateFormat = '%Y-%m-%d';
        if (groupBy === 'month') {
            dateFormat = '%Y-%m';
        } else if (groupBy === 'year') {
            dateFormat = '%Y';
        }

        const revenueData = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                    averageOrderValue: { $avg: '$totalAmount' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Revenue by restaurant
        const revenueByRestaurant = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$restaurant',
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { revenue: -1 } },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'restaurant',
                },
            },
            { $unwind: '$restaurant' },
            {
                $project: {
                    name: '$restaurant.name',
                    revenue: 1,
                    orders: 1,
                },
            },
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                revenueData,
                revenueByRestaurant,
            },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
