import mongoose, { Document, Schema } from 'mongoose';

export interface ILoyaltyPoints extends Document {
  user: mongoose.Schema.Types.ObjectId;
  points: number;
  lifetimePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  transactions: Array<{
    type: 'earned' | 'redeemed' | 'bonus' | 'expired';
    points: number;
    description: string;
    orderId?: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
  }>;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
  calculateTier(): string;
  addPoints(
    type: 'earned' | 'redeemed' | 'bonus' | 'expired',
    points: number,
    description: string,
    orderId?: mongoose.Schema.Types.ObjectId
  ): Promise<ILoyaltyPoints>;
}

const loyaltyPointsSchema = new Schema<ILoyaltyPoints>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
  },
  lifetimePoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
  },
  transactions: [{
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'bonus', 'expired'],
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    description: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Tier thresholds
export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 5000,
};

// Points earning rates
export const POINTS_RATES = {
  order: 1, // 1 point per $1 spent
  review: 50, // 50 points for leaving a review
  referral: 100, // 100 points for referring a friend
  dailyLogin: 10, // 10 points for daily login
};

loyaltyPointsSchema.methods.calculateTier = function(): string {
  const { lifetimePoints } = this;
  if (lifetimePoints >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (lifetimePoints >= TIER_THRESHOLDS.gold) return 'gold';
  if (lifetimePoints >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
};

loyaltyPointsSchema.methods.addPoints = async function(
  type: 'earned' | 'redeemed' | 'bonus' | 'expired',
  points: number,
  description: string,
  orderId?: mongoose.Schema.Types.ObjectId
) {
  const transaction = {
    type,
    points: Math.abs(points),
    description,
    orderId,
    createdAt: new Date(),
  };

  this.transactions.push(transaction);

  if (type === 'earned' || type === 'bonus') {
    this.points += Math.abs(points);
    this.lifetimePoints += Math.abs(points);
  } else if (type === 'redeemed' || type === 'expired') {
    this.points = Math.max(0, this.points - Math.abs(points));
  }

  this.tier = this.calculateTier();
  this.lastActivity = new Date();

  await this.save();
  return this;
};

const LoyaltyPoints = mongoose.model<ILoyaltyPoints>('LoyaltyPoints', loyaltyPointsSchema);
export default LoyaltyPoints;
