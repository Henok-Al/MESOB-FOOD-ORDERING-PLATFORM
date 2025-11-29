import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface IRestaurant extends Document {
    name: string;
    slug?: string;
    description?: string;
    cuisine: string;
    address: string;
    rating: number;
    imageUrl: string;
    deliveryTime: string;
    minOrder: number;
    isActive: boolean;
    status: 'pending' | 'approved' | 'rejected';
    owner?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>({
    name: {
        type: String,
        required: [true, 'Restaurant name is required'],
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        trim: true,
    },
    cuisine: {
        type: String,
        required: [true, 'Cuisine type is required'],
        trim: true,
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5,
    },
    imageUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    deliveryTime: {
        type: String,
        default: '30-45 min',
    },
    minOrder: {
        type: Number,
        default: 10,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create slug from name before saving
restaurantSchema.pre('save', function (next) {
    if (!this.isModified('name')) return next();
    this.slug = slugify(this.name, { lower: true });
    next();
});

const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
export default Restaurant;
