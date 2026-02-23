import express from 'express';
import {
    createReview,
    getRestaurantReviews,
    getDriverReviews,
    getMyReviews,
    updateReview,
    deleteReview,
    markHelpful,
    reportReview,
    canReviewOrder,
} from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
    .post(protect, createReview);

router.route('/my-reviews')
    .get(protect, getMyReviews);

router.route('/restaurant/:restaurantId')
    .get(getRestaurantReviews);

router.route('/driver/:driverId')
    .get(getDriverReviews);

router.route('/can-review/:orderId')
    .get(protect, canReviewOrder);

router.route('/:id')
    .patch(protect, updateReview)
    .delete(protect, deleteReview);

router.route('/:id/helpful')
    .post(protect, markHelpful);

router.route('/:id/report')
    .post(protect, reportReview);

export default router;
