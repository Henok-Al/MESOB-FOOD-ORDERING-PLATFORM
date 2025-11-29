import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    user: mongoose.Schema.Types.ObjectId;
    restaurant: mongoose.Schema.Types.ObjectId;
    order: mongoose.Schema.Types.ObjectId;
    rating: number;
    foodRating?: number;
    serviceRating?: number;
    deliveryRating?: number;
    comment?: string;
    photos?: string[];
    helpfulCount: number;
    isVerified: boolean;
    restaurantResponse?: {
        comment: string;
        respondedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    foodRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    serviceRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    deliveryRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        maxlength: 1000,
    },
    photos: [String],
    helpfulCount: {
        type: Number,
        default: 0,
    },
    isVerified: {
        type: Boolean,
        default: true,
    },
    restaurantResponse: {
        comment: String,
        respondedAt: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// Ensure one review per order
reviewSchema.index({ order: 1 }, { unique: true });

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
