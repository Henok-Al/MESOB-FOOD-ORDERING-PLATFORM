import express from 'express';
import {
    createReview,
    getRestaurantReviews,
    getMyReviews,
    respondToReview,
    markHelpful,
} from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
    .post(protect, createReview);

router.route('/my-reviews')
    .get(protect, getMyReviews);

router.route('/restaurant/:restaurantId')
    .get(getRestaurantReviews);

router.route('/:id/respond')
    .post(protect, respondToReview);

router.route('/:id/helpful')
    .post(protect, markHelpful);

export default router;
