import { Request, Response } from 'express';
import { Wallet, WalletTransaction, PaymentMethod } from '../models/Wallet';
import mongoose from 'mongoose';

// @desc    Get or create user's wallet
// @route   GET /api/wallet
// @access  Private
export const getWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      // Create wallet if doesn't exist
      wallet = await Wallet.create({ user: userId });
    }

    // Get recent transactions
    const recentTransactions = await WalletTransaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        wallet,
        recentTransactions,
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Add funds to wallet
// @route   POST /api/wallet/add-funds
// @access  Private
export const addFunds = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { amount, paymentMethodId } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ status: 'fail', message: 'Invalid amount' });
      return;
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      res.status(404).json({ status: 'fail', message: 'Wallet not found' });
      return;
    }

    // In production, verify payment with Stripe/PayPal here
    // For now, simulate successful payment

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update wallet balance
      const newBalance = wallet.balance + amount;
      await Wallet.findByIdAndUpdate(
        wallet._id,
        { balance: newBalance },
        { session }
      );

      // Create transaction record
      const transaction = await WalletTransaction.create(
        [
          {
            wallet: wallet._id,
            user: userId,
            type: 'credit',
            amount,
            balanceAfter: newBalance,
            description: 'Added funds to wallet',
            reference: `ADD-${Date.now()}`,
            status: 'completed',
          },
        ],
        { session }
      );

      await session.commitTransaction();

      res.status(200).json({
        status: 'success',
        data: {
          wallet: await Wallet.findById(wallet._id),
          transaction: transaction[0],
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get wallet transaction history
// @route   GET /api/wallet/transactions
// @access  Private
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { page = 1, limit = 20, type } = req.query;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      res.status(404).json({ status: 'fail', message: 'Wallet not found' });
      return;
    }

    const query: any = { wallet: wallet._id };
    if (type) query.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await WalletTransaction.find(query)
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await WalletTransaction.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: { transactions },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get all payment methods
// @route   GET /api/wallet/payment-methods
// @access  Private
export const getPaymentMethods = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    const paymentMethods = await PaymentMethod.find({
      user: userId,
      isActive: true,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: paymentMethods.length,
      data: { paymentMethods },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Add payment method
// @route   POST /api/wallet/payment-methods
// @access  Private
export const addPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const {
      type,
      nickname,
      cardDetails,
      bankDetails,
      stripePaymentMethodId,
      paypalEmail,
      billingAddress,
      isDefault,
    } = req.body;

    // In production, verify with Stripe here
    // const stripeCustomer = await createStripeCustomer(userId, stripePaymentMethodId);

    const paymentMethod = await PaymentMethod.create({
      user: userId,
      type,
      nickname,
      cardDetails,
      bankDetails,
      stripePaymentMethodId,
      paypalEmail,
      billingAddress,
      isDefault: isDefault || false,
    });

    res.status(201).json({
      status: 'success',
      data: { paymentMethod },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Update payment method
// @route   PATCH /api/wallet/payment-methods/:id
// @access  Private
export const updatePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;
    const { nickname, isDefault, billingAddress } = req.body;

    const paymentMethod = await PaymentMethod.findOneAndUpdate(
      { _id: id, user: userId },
      { nickname, isDefault, billingAddress },
      { new: true }
    );

    if (!paymentMethod) {
      res.status(404).json({ status: 'fail', message: 'Payment method not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { paymentMethod },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Delete payment method
// @route   DELETE /api/wallet/payment-methods/:id
// @access  Private
export const deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findOneAndUpdate(
      { _id: id, user: userId },
      { isActive: false },
      { new: true }
    );

    if (!paymentMethod) {
      res.status(404).json({ status: 'fail', message: 'Payment method not found' });
      return;
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Set default payment method
// @route   POST /api/wallet/payment-methods/:id/default
// @access  Private
export const setDefaultPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;

    // Find the payment method
    const paymentMethod = await PaymentMethod.findOne({ _id: id, user: userId });
    if (!paymentMethod) {
      res.status(404).json({ status: 'fail', message: 'Payment method not found' });
      return;
    }

    // Set all payment methods to non-default
    await PaymentMethod.updateMany(
      { user: userId },
      { isDefault: false }
    );

    // Set the selected one as default
    paymentMethod.isDefault = true;
    await paymentMethod.save();

    res.status(200).json({
      status: 'success',
      data: { paymentMethod },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Update wallet auto-recharge settings
// @route   PATCH /api/wallet/auto-recharge
// @access  Private
export const updateAutoRecharge = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { enabled, threshold, amount, paymentMethod } = req.body;

    const wallet = await Wallet.findOneAndUpdate(
      { user: userId },
      {
        autoRecharge: {
          enabled,
          threshold,
          amount,
          paymentMethod,
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: 'success',
      data: { wallet },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Deduct from wallet (for order payment)
// @route   POST /api/wallet/deduct
// @access  Private
export const deductFromWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ status: 'fail', message: 'Invalid amount' });
      return;
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      res.status(404).json({ status: 'fail', message: 'Wallet not found' });
      return;
    }

    if (wallet.balance < amount) {
      res.status(400).json({ status: 'fail', message: 'Insufficient wallet balance' });
      return;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newBalance = wallet.balance - amount;
      await Wallet.findByIdAndUpdate(
        wallet._id,
        { balance: newBalance },
        { session }
      );

      const transaction = await WalletTransaction.create(
        [
          {
            wallet: wallet._id,
            user: userId,
            type: 'debit',
            amount,
            balanceAfter: newBalance,
            description: `Payment for order ${orderId}`,
            reference: `PAY-${orderId}`,
            order: orderId,
            status: 'completed',
          },
        ],
        { session }
      );

      await session.commitTransaction();

      res.status(200).json({
        status: 'success',
        data: {
          success: true,
          transaction: transaction[0],
          remainingBalance: newBalance,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
