import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    product: mongoose.Schema.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
}

export interface IOrder extends Document {
    user: mongoose.Schema.Types.ObjectId;
    restaurant: mongoose.Schema.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';
    deliveryAddress: string;
    paymentMethod: 'card' | 'cash';
    paymentStatus: 'pending' | 'paid' | 'failed';
    createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
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
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending',
    },
    deliveryAddress: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash'],
        default: 'card',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
