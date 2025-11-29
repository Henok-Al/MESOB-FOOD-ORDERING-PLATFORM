import { stripe } from '../config/stripe';
import Payment from '../models/Payment';
import Stripe from 'stripe';

interface CreatePaymentIntentParams {
    amount: number;
    currency?: string;
    metadata?: any;
}

interface PaymentIntentResult {
    clientSecret: string;
    paymentIntentId: string;
}

/**
 * Create a Stripe payment intent
 */
export const createPaymentIntent = async (
    params: CreatePaymentIntentParams
): Promise<PaymentIntentResult> => {
    const { amount, currency = 'usd', metadata = {} } = params;

    // Amount must be in cents for Stripe
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata,
        automatic_payment_methods: {
            enabled: true,
        },
    });

    return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
    };
};

/**
 * Retrieve payment intent details
 */
export const retrievePaymentIntent = async (
    paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
};

/**
 * Confirm payment and save to database
 */
export const confirmPayment = async (
    paymentIntentId: string,
    orderId: string,
    userId: string
): Promise<any> => {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment has not succeeded');
    }

    // Save payment to database
    const payment = await Payment.create({
        order: orderId,
        user: userId,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        status: 'succeeded',
        stripePaymentIntentId: paymentIntent.id,
        paymentMethod: paymentIntent.payment_method as string,
        metadata: paymentIntent.metadata,
    });

    return payment;
};

/**
 * Refund a payment
 */
export const refundPayment = async (
    paymentIntentId: string,
    amount?: number
): Promise<Stripe.Refund> => {
    const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
    };

    if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundParams);

    // Update payment status in database
    await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { status: 'refunded' }
    );

    return refund;
};

/**
 * Get payment history for a user
 */
export const getPaymentHistory = async (userId: string): Promise<any[]> => {
    return await Payment.find({ user: userId })
        .populate('order')
        .sort({ createdAt: -1 });
};

/**
 * Get payment by order ID
 */
export const getPaymentByOrder = async (orderId: string): Promise<any> => {
    return await Payment.findOne({ order: orderId }).populate('user', 'firstName lastName email');
};
