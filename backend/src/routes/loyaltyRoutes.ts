import express from 'express';
import {
  getMyLoyaltyPoints,
  earnPointsFromOrder,
  redeemPoints,
  getTierBenefits,
  getLeaderboard,
  awardReviewPoints,
  applyReferralCode,
} from '../controllers/loyaltyController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getMyLoyaltyPoints);
router.post('/earn', earnPointsFromOrder);
router.post('/redeem', redeemPoints);
router.post('/referral', applyReferralCode);
router.post('/award-review-points', awardReviewPoints);
router.get('/tier-benefits', getTierBenefits);
router.get('/leaderboard', getLeaderboard);

export default router;
