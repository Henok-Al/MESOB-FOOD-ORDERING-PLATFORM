import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

// Business hours interface
export interface IBusinessHours {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    openTime: string; // Format: "HH:MM" (24-hour)
    closeTime: string; // Format: "HH:MM" (24-hour)
    isClosed: boolean;
}

// Location interface for geospatial queries
export interface ILocation {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

// Social media links interface
export interface ISocialMedia {
    facebook?: string;
    instagram?: string;
    twitter?: string;
}

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

    // New fields
    phone?: string;
    email?: string;
    website?: string;
    location?: ILocation;
    hours?: IBusinessHours[];
    gallery?: string[];
    tags?: string[];
    socialMedia?: ISocialMedia;
    isFeatured: boolean;
    viewCount: number;
}

const businessHoursSchema = new Schema<IBusinessHours>({
    day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true,
    },
    openTime: {
        type: String,
        required: true,
    },
    closeTime: {
        type: String,
        required: true,
    },
    isClosed: {
        type: Boolean,
        default: false,
    },
}, { _id: false });

const locationSchema = new Schema<ILocation>({
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
    },
    coordinates: {
        type: [Number],
        required: true,
    },
}, { _id: false });

const socialMediaSchema = new Schema<ISocialMedia>({
    facebook: String,
    instagram: String,
    twitter: String,
}, { _id: false });

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

    // New fields
    phone: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    website: {
        type: String,
        trim: true,
    },
    location: locationSchema,
    hours: [businessHoursSchema],
    gallery: {
        type: [String],
        default: [],
    },
    tags: {
        type: [String],
        default: [],
    },
    socialMedia: socialMediaSchema,
    isFeatured: {
        type: Boolean,
        default: false,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
});

// Create slug from name before saving
restaurantSchema.pre('save', function (next) {
    if (!this.isModified('name')) return next();
    this.slug = slugify(this.name, { lower: true });
    next();
});

// Create geospatial index for location-based queries
restaurantSchema.index({ location: '2dsphere' });

// Create indexes for common queries
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ tags: 1 });
restaurantSchema.index({ isFeatured: 1 });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ status: 1, isActive: 1 });

const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
export default Restaurant;
