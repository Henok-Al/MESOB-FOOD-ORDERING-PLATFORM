import api from './api';

export interface LoyaltyAccount {
  points: number;
  lifetimePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsToNextTier: number;
  nextTier: string | null;
  recentTransactions: LoyaltyTransaction[];
}

export interface LoyaltyTransaction {
  type: 'earned' | 'redeemed' | 'bonus' | 'expired';
  points: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface TierBenefit {
  name: string;
  minPoints: number;
  benefits: string[];
}

export interface TierBenefits {
  bronze: TierBenefit;
  silver: TierBenefit;
  gold: TierBenefit;
  platinum: TierBenefit;
}

export interface LeaderboardEntry {
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  lifetimePoints: number;
  tier: string;
}

export interface EarnPointsResult {
  pointsEarned: number;
  bonusPoints: number;
  totalPointsEarned: number;
  currentPoints: number;
  currentTier: string;
}

export interface RedeemPointsResult {
  pointsRedeemed: number;
  discountValue: number;
  currentPoints: number;
  message: string;
}

// Get user's loyalty account
export const getLoyaltyAccount = async (): Promise<LoyaltyAccount> => {
  const response = await api.get('/loyalty');
  return response.data.data;
};

// Earn points from an order
export const earnPointsFromOrder = async (orderId: string): Promise<EarnPointsResult> => {
  const response = await api.post('/loyalty/earn', { orderId });
  return response.data.data;
};

// Redeem points for discount
export const redeemPoints = async (
  points: number,
  description?: string
): Promise<RedeemPointsResult> => {
  const response = await api.post('/loyalty/redeem', { points, description });
  return response.data.data;
};

// Get tier benefits
export const getTierBenefits = async (): Promise<{
  benefits: TierBenefits;
  thresholds: Record<string, number>;
}> => {
  const response = await api.get('/loyalty/tier-benefits');
  return response.data.data;
};

// Get leaderboard
export const getLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  const response = await api.get('/loyalty/leaderboard', { params: { limit } });
  return response.data.data.leaderboard;
};

// Award points for review
export const awardReviewPoints = async (): Promise<{
  pointsEarned: number;
  currentPoints: number;
  message: string;
}> => {
  const response = await api.post('/loyalty/award-review-points');
  return response.data.data;
};

// Apply referral code
export const applyReferralCode = async (referralCode: string): Promise<{
  pointsEarned: number;
  message: string;
}> => {
  const response = await api.post('/loyalty/referral', { referralCode });
  return response.data.data;
};

// Calculate potential points for an order
export const calculatePotentialPoints = (
  orderAmount: number,
  tier: string
): { basePoints: number; bonusPoints: number; totalPoints: number } => {
  const basePoints = Math.floor(orderAmount); // 1 point per $1

  let bonusMultiplier = 0;
  switch (tier) {
    case 'silver':
      bonusMultiplier = 0.1;
      break;
    case 'gold':
      bonusMultiplier = 0.25;
      break;
    case 'platinum':
      bonusMultiplier = 0.5;
      break;
  }

  const bonusPoints = Math.floor(basePoints * bonusMultiplier);
  const totalPoints = basePoints + bonusPoints;

  return { basePoints, bonusPoints, totalPoints };
};

// Calculate discount from points
export const calculateDiscountFromPoints = (points: number): number => {
  // 100 points = $1
  return points / 100;
};

// Calculate points needed for discount amount
export const calculatePointsForDiscount = (discountAmount: number): number => {
  // $1 = 100 points
  return Math.ceil(discountAmount * 100);
};

export default {
  getLoyaltyAccount,
  earnPointsFromOrder,
  redeemPoints,
  getTierBenefits,
  getLeaderboard,
  awardReviewPoints,
  applyReferralCode,
  calculatePotentialPoints,
  calculateDiscountFromPoints,
  calculatePointsForDiscount,
};
