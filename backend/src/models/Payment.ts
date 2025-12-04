import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
    order: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed' | 'refunded';
    stripePaymentIntentId: string;
    paymentMethod: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            required: true,
            default: 'usd',
            uppercase: true,
        },
        status: {
            type: String,
            enum: ['pending', 'succeeded', 'failed', 'refunded'],
            default: 'pending',
        },
        stripePaymentIntentId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
