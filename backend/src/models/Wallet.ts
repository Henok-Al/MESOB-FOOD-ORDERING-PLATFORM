import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  isActive: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  autoRecharge?: {
    enabled: boolean;
    threshold: number;
    amount: number;
    paymentMethod: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IWalletTransaction extends Document {
  wallet: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: 'credit' | 'debit' | 'refund' | 'cashback' | 'transfer_in' | 'transfer_out';
  amount: number;
  currency: string;
  balanceAfter: number;
  description: string;
  reference?: string;
  order?: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IPaymentMethod extends Document {
  user: mongoose.Types.ObjectId;
  type: 'card' | 'bank_account' | 'paypal' | 'apple_pay' | 'google_pay';
  isDefault: boolean;
  isActive: boolean;
  nickname?: string;
  // Card specific
  cardDetails?: {
    last4: string;
    brand: string;
    expiryMonth: string;
    expiryYear: string;
    holderName: string;
  };
  // Bank account specific
  bankDetails?: {
    accountNumberLast4: string;
    bankName: string;
    accountType: 'checking' | 'savings';
  };
  // Stripe/PayPal tokens
  stripePaymentMethodId?: string;
  paypalEmail?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dailyLimit: {
      type: Number,
      default: 500,
    },
    monthlyLimit: {
      type: Number,
      default: 5000,
    },
    autoRecharge: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 20 },
      amount: { type: Number, default: 50 },
      paymentMethod: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const WalletTransactionSchema: Schema = new Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit', 'refund', 'cashback', 'transfer_in', 'transfer_out'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentMethodSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['card', 'bank_account', 'paypal', 'apple_pay', 'google_pay'],
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    nickname: {
      type: String,
    },
    cardDetails: {
      last4: String,
      brand: String,
      expiryMonth: String,
      expiryYear: String,
      holderName: String,
    },
    bankDetails: {
      accountNumberLast4: String,
      bankName: String,
      accountType: { type: String, enum: ['checking', 'savings'] },
    },
    stripePaymentMethodId: {
      type: String,
      select: false, // Don't return by default for security
    },
    paypalEmail: {
      type: String,
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for transaction queries
WalletTransactionSchema.index({ createdAt: -1 });
WalletTransactionSchema.index({ type: 1, createdAt: -1 });

// Pre-save middleware to handle default payment method logic
PaymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // Set all other payment methods for this user to non-default
    await mongoose.model('PaymentMethod').updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
export const WalletTransaction = mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
export const PaymentMethod = mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);
