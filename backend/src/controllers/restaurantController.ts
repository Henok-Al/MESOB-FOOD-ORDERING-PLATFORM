import { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';

export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
    try {
        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Build query
        const query: any = { isActive: true };

        // Search by name
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }

        // Filter by cuisine
        if (req.query.cuisine) {
            query.cuisine = { $regex: req.query.cuisine, $options: 'i' };
        }

        // Filter by rating
        if (req.query.minRating) {
            query.rating = { $gte: parseFloat(req.query.minRating as string) };
        }

        // Filter by delivery time
        if (req.query.maxDeliveryTime) {
            query.deliveryTime = { $lte: req.query.maxDeliveryTime };
        }

        // Sorting
        let sort: any = {};
        if (req.query.sortBy) {
            const sortField = req.query.sortBy as string;
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
            sort[sortField] = sortOrder;
        } else {
            sort = { createdAt: -1 }; // Default sort by newest
        }

        // Execute query
        const restaurants = await Restaurant.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Restaurant.countDocuments(query);

        res.status(200).json({
            status: 'success',
            results: restaurants.length,
            data: {
                restaurants,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        const newRestaurant = await Restaurant.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                restaurant: newRestaurant,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// Seed some data
export const seedRestaurants = async (req: Request, res: Response): Promise<void> => {
    try {
        // Clear existing data to avoid duplicates/conflicts
        await Restaurant.deleteMany({});

        await Restaurant.create([
            {
                name: 'Burger King',
                description: 'American, Fast Food, Burgers',
                cuisine: 'American',
                address: '123 Main St',
                rating: 4.2,
                imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80',
                deliveryTime: '20-30 min',
                minOrder: 15,
            },
            {
                name: 'Pizza Hut',
                description: 'Italian, Pizza, Fast Food',
                cuisine: 'Italian',
                address: '456 Oak Ave',
                rating: 4.5,
                imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                deliveryTime: '30-45 min',
                minOrder: 20,
            },
            {
                name: 'Sushi Master',
                description: 'Japanese, Sushi, Asian',
                cuisine: 'Japanese',
                address: '789 Pine Ln',
                rating: 4.8,
                imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                deliveryTime: '40-50 min',
                minOrder: 25,
            },
        ]);
        res.status(201).json({ status: 'success', message: 'Seeded successfully' });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
// @desc    Get all restaurants (Admin)
// @route   GET /api/restaurants/admin/all
// @access  Private (Admin)
export const getAllRestaurants = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurants = await Restaurant.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            results: restaurants.length,
            data: { restaurants },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            res.status(404).json({ status: 'fail', message: 'Restaurant not found' });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: { restaurant },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Update restaurant
// @route   PATCH /api/restaurants/:id
// @access  Private (Owner/Admin)
export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!restaurant) {
            res.status(404).json({ status: 'fail', message: 'Restaurant not found' });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: { restaurant },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Admin)
export const deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
        if (!restaurant) {
            res.status(404).json({ status: 'fail', message: 'Restaurant not found' });
            return;
        }
        res.status(204).json({ status: 'success', data: null });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Update restaurant status
// @route   PATCH /api/restaurants/:id/status
// @access  Private (Admin)
export const updateRestaurantStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { status, isActive: status === 'approved' },
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            res.status(404).json({ status: 'fail', message: 'Restaurant not found' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { restaurant },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get current user's restaurant
// @route   GET /api/restaurants/me
// @access  Private (Restaurant Owner)
export const getMyRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const restaurant = await Restaurant.findOne({ owner: userId });

        if (!restaurant) {
            res.status(404).json({ status: 'fail', message: 'Restaurant not found for this user' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { restaurant },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get featured restaurants
// @route   GET /api/restaurants/featured
// @access  Public
export const getFeaturedRestaurants = async (req: Request, res: Response): Promise<void> => {
    try {
        const limit = parseInt(req.query.limit as string) || 6;

        const restaurants = await Restaurant.find({
            isFeatured: true,
            isActive: true,
            status: 'approved'
        })
            .sort({ rating: -1, viewCount: -1 })
            .limit(limit);

        res.status(200).json({
            status: 'success',
            results: restaurants.length,
            data: { restaurants },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Increment restaurant view count
// @route   POST /api/restaurants/:id/view
// @access  Public
export const incrementViewCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewCount: 1 } },
            { new: true }
        );

        if (!restaurant) {
            res.status(404).json({ status: 'fail', message: 'Restaurant not found' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { viewCount: restaurant.viewCount },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Update restaurant business hours
// @route   PATCH /api/restaurants/:id/hours
// @access  Private (Owner/Admin)
export const updateRestaurantHours = async (req: Request, res: Response): Promise<void> => {
    try {
        const { hours } = req.body;

        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { hours },
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            res.status(404).json({ status: 'fail', message: 'Restaurant not found' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { restaurant },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get restaurant analytics
// @route   GET /api/restaurants/:id/analytics
// @access  Private (Owner/Admin)
export const getRestaurantAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurantId = req.params.id;

        // Import Order model dynamically to avoid circular dependency
        const Order = require('../models/Order').default;
        const Review = require('../models/Review').default;

        // Get all orders for this restaurant
        const orders = await Order.find({
            restaurant: restaurantId,
            status: { $in: ['delivered', 'completed'] }
        });

        // Calculate basic stats
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Get all orders including pending/cancelled for completion rate
        const allOrders = await Order.find({ restaurant: restaurantId });
        const completionRate = allOrders.length > 0
            ? (totalOrders / allOrders.length) * 100
            : 0;

        // Get popular items
        const itemStats: any = {};
        orders.forEach((order: any) => {
            order.items.forEach((item: any) => {
                const productId = item.product.toString();
                if (!itemStats[productId]) {
                    itemStats[productId] = {
                        productId,
                        name: item.name,
                        orderCount: 0,
                        revenue: 0,
                    };
                }
                itemStats[productId].orderCount += item.quantity;
                itemStats[productId].revenue += item.price * item.quantity;
            });
        });

        const popularItems = Object.values(itemStats)
            .sort((a: any, b: any) => b.orderCount - a.orderCount)
            .slice(0, 10);

        // Get revenue by period (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentOrders = orders.filter((order: any) =>
            new Date(order.createdAt) >= thirtyDaysAgo
        );

        const revenueByDate: any = {};
        recentOrders.forEach((order: any) => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            if (!revenueByDate[date]) {
                revenueByDate[date] = { date, revenue: 0, orders: 0 };
            }
            revenueByDate[date].revenue += order.totalAmount;
            revenueByDate[date].orders += 1;
        });

        const revenueByPeriod = Object.values(revenueByDate).sort((a: any, b: any) =>
            a.date.localeCompare(b.date)
        );

        // Get review stats
        const reviews = await Review.find({ restaurant: restaurantId });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
            : 0;

        // Rating distribution
        const ratingDist: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((review: any) => {
            ratingDist[Math.floor(review.rating)] += 1;
        });

        const ratingDistribution = Object.entries(ratingDist).map(([rating, count]) => ({
            rating: parseInt(rating),
            count: count as number,
        }));

        res.status(200).json({
            status: 'success',
            data: {
                restaurantId,
                totalOrders,
                totalRevenue,
                averageOrderValue,
                completionRate,
                popularItems,
                revenueByPeriod,
                averageRating,
                totalReviews,
                ratingDistribution,
            },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
