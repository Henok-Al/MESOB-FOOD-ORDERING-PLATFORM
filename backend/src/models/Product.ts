import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description?: string;
    price: number;
    image: string;
    category: string;
    restaurant: mongoose.Schema.Types.ObjectId;
    isAvailable: boolean;
    createdAt: Date;
}

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0,
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'Product must belong to a restaurant'],
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
