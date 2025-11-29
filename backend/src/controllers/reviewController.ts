import { Request, Response } from 'express';
import Review from '../models/Review';
import Restaurant from '../models/Restaurant';
import Order from '../models/Order';
import { OrderStatus } from '@food-ordering/constants';

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId, rating, foodRating, serviceRating, deliveryRating, comment, photos } = req.body;

        // Check if order exists and belongs to user
        const order = await Order.findById(orderId);
        if (!order) {
            res.status(404).json({ status: 'fail', message: 'Order not found' });
            return;
        }

        if (order.user.toString() !== req.user!._id.toString()) {
            res.status(403).json({ status: 'fail', message: 'Not authorized' });
            return;
        }

        // Check if order is delivered
        if (order.status !== OrderStatus.DELIVERED) {
            res.status(400).json({ status: 'fail', message: 'Can only review delivered orders' });
            return;
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ order: orderId });
        if (existingReview) {
            res.status(400).json({ status: 'fail', message: 'Review already exists for this order' });
            return;
        }

        const review = await Review.create({
            user: req.user!._id,
            restaurant: order.restaurant,
            order: orderId,
            rating,
            foodRating,
            serviceRating,
            deliveryRating,
            comment,
            photos,
        });

        // Update restaurant rating
        await updateRestaurantRating(order.restaurant.toString());

        res.status(201).json({
            status: 'success',
            data: { review },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
export const getRestaurantReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { restaurantId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ restaurant: restaurantId })
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ restaurant: restaurantId });

        res.status(200).json({
            status: 'success',
            data: {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await Review.find({ user: req.user!._id })
            .populate('restaurant', 'name imageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            data: { reviews },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Restaurant responds to review
// @route   POST /api/reviews/:id/respond
// @access  Private (Restaurant Owner)
export const respondToReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { comment } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            res.status(404).json({ status: 'fail', message: 'Review not found' });
            return;
        }

        review.restaurantResponse = {
            comment,
            respondedAt: new Date(),
        };

        await review.save();

        res.status(200).json({
            status: 'success',
            data: { review },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const markHelpful = async (req: Request, res: Response): Promise<void> => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            res.status(404).json({ status: 'fail', message: 'Review not found' });
            return;
        }

        review.helpfulCount += 1;
        await review.save();

        res.status(200).json({
            status: 'success',
            data: { review },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// Helper function to update restaurant rating
async function updateRestaurantRating(restaurantId: string) {
    const reviews = await Review.find({ restaurant: restaurantId });

    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    });
}
