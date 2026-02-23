import { Request, Response } from 'express';
import LoyaltyPoints, { POINTS_RATES, TIER_THRESHOLDS } from '../models/LoyaltyPoints';
import Order from '../models/Order';

// @desc    Get user's loyalty points
// @route   GET /api/loyalty
// @access  Private
export const getMyLoyaltyPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    let loyalty = await LoyaltyPoints.findOne({ user: userId });

    if (!loyalty) {
      loyalty = await LoyaltyPoints.create({
        user: userId,
        points: 0,
        lifetimePoints: 0,
        tier: 'bronze',
      });
    }

    // Calculate points to next tier
    const currentTierThreshold = TIER_THRESHOLDS[loyalty.tier];
    const nextTier = Object.entries(TIER_THRESHOLDS).find(([_, threshold]) => threshold > loyalty.lifetimePoints);
    const pointsToNextTier = nextTier ? nextTier[1] - loyalty.lifetimePoints : 0;

    res.status(200).json({
      status: 'success',
      data: {
        points: loyalty.points,
        lifetimePoints: loyalty.lifetimePoints,
        tier: loyalty.tier,
        pointsToNextTier,
        nextTier: nextTier ? nextTier[0] : null,
        recentTransactions: loyalty.transactions.slice(-10).reverse(),
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Earn points from order
// @route   POST /api/loyalty/earn
// @access  Private
export const earnPointsFromOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;
    const userId = (req as any).user._id;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ status: 'fail', message: 'Order not found' });
      return;
    }

    // Check if user owns the order
    if (order.user.toString() !== userId.toString()) {
      res.status(403).json({ status: 'fail', message: 'Not authorized' });
      return;
    }

    let loyalty = await LoyaltyPoints.findOne({ user: userId });
    if (!loyalty) {
      loyalty = new LoyaltyPoints({
        user: userId,
        points: 0,
        lifetimePoints: 0,
        tier: 'bronze',
      });
    }

    // Calculate points (1 point per $1 spent)
    const pointsToEarn = Math.floor(order.totalAmount * POINTS_RATES.order);

    // Check for tier bonus
    let bonusPoints = 0;
    if (loyalty.tier === 'silver') bonusPoints = Math.floor(pointsToEarn * 0.1); // 10% bonus
    if (loyalty.tier === 'gold') bonusPoints = Math.floor(pointsToEarn * 0.25); // 25% bonus
    if (loyalty.tier === 'platinum') bonusPoints = Math.floor(pointsToEarn * 0.5); // 50% bonus

    const totalPoints = pointsToEarn + bonusPoints;

    await loyalty.addPoints('earned', totalPoints, `Order #${orderId.toString().slice(-6)}`, orderId);

    if (bonusPoints > 0) {
      await loyalty.addPoints('bonus', bonusPoints, `${loyalty.tier} tier bonus`, orderId);
    }

    res.status(200).json({
      status: 'success',
      data: {
        pointsEarned: pointsToEarn,
        bonusPoints,
        totalPointsEarned: totalPoints,
        currentPoints: loyalty.points,
        currentTier: loyalty.tier,
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Redeem points
// @route   POST /api/loyalty/redeem
// @access  Private
export const redeemPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { points, description } = req.body;
    const userId = (req as any).user._id;

    const loyalty = await LoyaltyPoints.findOne({ user: userId });
    if (!loyalty) {
      res.status(400).json({ status: 'fail', message: 'No loyalty account found' });
      return;
    }

    if (loyalty.points < points) {
      res.status(400).json({ status: 'fail', message: 'Insufficient points' });
      return;
    }

    await loyalty.addPoints('redeemed', points, description || 'Points redeemed');

    // Calculate discount value (100 points = $1)
    const discountValue = points / 100;

    res.status(200).json({
      status: 'success',
      data: {
        pointsRedeemed: points,
        discountValue,
        currentPoints: loyalty.points,
        message: `You redeemed ${points} points for $${discountValue.toFixed(2)} off!`,
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get tier benefits
// @route   GET /api/loyalty/tier-benefits
// @access  Public
export const getTierBenefits = async (req: Request, res: Response): Promise<void> => {
  try {
    const benefits = {
      bronze: {
        name: 'Bronze',
        minPoints: TIER_THRESHOLDS.bronze,
        benefits: [
          'Earn 1 point per $1 spent',
          'Access to member-only promotions',
          'Birthday reward',
        ],
      },
      silver: {
        name: 'Silver',
        minPoints: TIER_THRESHOLDS.silver,
        benefits: [
          'Earn 1.1 points per $1 spent (10% bonus)',
          'Free delivery on orders over $25',
          'Priority customer support',
          'All Bronze benefits',
        ],
      },
      gold: {
        name: 'Gold',
        minPoints: TIER_THRESHOLDS.gold,
        benefits: [
          'Earn 1.25 points per $1 spent (25% bonus)',
          'Free delivery on all orders',
          'Exclusive restaurant access',
          'Double points on weekends',
          'All Silver benefits',
        ],
      },
      platinum: {
        name: 'Platinum',
        minPoints: TIER_THRESHOLDS.platinum,
        benefits: [
          'Earn 1.5 points per $1 spent (50% bonus)',
          'Free delivery + no service fees',
          'Dedicated support line',
          'Triple points on weekends',
          'Surprise rewards',
          'All Gold benefits',
        ],
      },
    };

    res.status(200).json({
      status: 'success',
      data: { benefits, thresholds: TIER_THRESHOLDS },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get loyalty leaderboard
// @route   GET /api/loyalty/leaderboard
// @access  Public
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await LoyaltyPoints.find()
      .sort({ lifetimePoints: -1 })
      .limit(Number(limit))
      .populate('user', 'firstName lastName avatar')
      .select('user lifetimePoints tier');

    res.status(200).json({
      status: 'success',
      results: leaderboard.length,
      data: { leaderboard },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Award points for review
// @route   POST /api/loyalty/award-review-points
// @access  Private
export const awardReviewPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    let loyalty = await LoyaltyPoints.findOne({ user: userId });
    if (!loyalty) {
      loyalty = new LoyaltyPoints({
        user: userId,
        points: 0,
        lifetimePoints: 0,
        tier: 'bronze',
      });
    }

    await loyalty.addPoints('earned', POINTS_RATES.review, 'Left a restaurant review');

    res.status(200).json({
      status: 'success',
      data: {
        pointsEarned: POINTS_RATES.review,
        currentPoints: loyalty.points,
        message: `You earned ${POINTS_RATES.review} points for your review!`,
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Apply referral code
// @route   POST /api/loyalty/referral
// @access  Private
export const applyReferralCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { referralCode } = req.body;
    const userId = (req as any).user._id;

    if (!referralCode) {
      res.status(400).json({ status: 'fail', message: 'Referral code is required' });
      return;
    }

    // Find user with this referral code
    const referrerLoyalty = await LoyaltyPoints.findOne({ referralCode });
    
    if (!referrerLoyalty) {
      res.status(400).json({ status: 'fail', message: 'Invalid referral code' });
      return;
    }

    // Check if user is referring themselves
    if (referrerLoyalty.user.toString() === userId.toString()) {
      res.status(400).json({ status: 'fail', message: 'You cannot refer yourself' });
      return;
    }

    // Check if user already used a referral
    const currentUserLoyalty = await LoyaltyPoints.findOne({ user: userId });
    if (currentUserLoyalty && currentUserLoyalty.transactions.some(t => t.description.includes('referred by'))) {
      res.status(400).json({ status: 'fail', message: 'You have already used a referral code' });
      return;
    }

    // Award points to both users
    const bonusPoints = POINTS_RATES.referral;

    if (currentUserLoyalty) {
      await currentUserLoyalty.addPoints('bonus', bonusPoints, `Referred by ${referralCode}`);
    } else {
      const newLoyalty = new LoyaltyPoints({
        user: userId,
        points: bonusPoints,
        lifetimePoints: bonusPoints,
        tier: 'bronze',
        transactions: [{
          type: 'bonus',
          points: bonusPoints,
          description: `Referred by ${referralCode}`,
          createdAt: new Date(),
        }]
      });
      await newLoyalty.save();
    }

    // Award points to referrer
    await referrerLoyalty.addPoints('bonus', bonusPoints, `Referred a new user`);

    res.status(200).json({
      status: 'success',
      data: {
        pointsEarned: bonusPoints,
        message: `You earned ${bonusPoints} points! Your friend also earned ${bonusPoints} points.`,
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
