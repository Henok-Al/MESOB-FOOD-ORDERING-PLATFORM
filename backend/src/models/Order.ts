import mongoose, { Document, Schema } from 'mongoose';
import { OrderStatus } from '@food-ordering/constants';

export interface IOrderItem {
    product: mongoose.Schema.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
}

export interface IStatusHistory {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
    updatedBy?: mongoose.Schema.Types.ObjectId;
}

export interface IOrder extends Document {
    user: mongoose.Schema.Types.ObjectId;
    restaurant: mongoose.Schema.Types.ObjectId;
    items: IOrderItem[];
    subtotal?: number;
    deliveryFee?: number;
    discount?: number;
    totalAmount: number;
    status: OrderStatus;
    statusHistory: IStatusHistory[];
    deliveryAddress: string;
    addressId?: mongoose.Schema.Types.ObjectId;
    contactName?: string;
    contactPhone?: string;
    contactlessDelivery?: boolean;
    promoCode?: string;
    paymentMethod: 'card' | 'cash';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    payment?: {
        paymentIntentId?: string;
        paymentStatus?: string;
        paymentMethod?: string;
        paidAmount?: number;
    };
    estimatedDeliveryTime?: Date;
    actualDeliveryTime?: Date;
    preparationTime?: number;
    customerNotes?: string;
    driverNotes?: string;
    cancellationReason?: string;
    driver?: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
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
    subtotal: {
        type: Number,
        default: 0,
    },
    deliveryFee: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.PENDING,
    },
    statusHistory: [
        {
            status: {
                type: String,
                enum: Object.values(OrderStatus),
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
            note: String,
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        },
    ],
    deliveryAddress: {
        type: String,
        required: true,
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    contactName: {
        type: String,
    },
    contactPhone: {
        type: String,
    },
    contactlessDelivery: {
        type: Boolean,
        default: false,
    },
    promoCode: {
        type: String,
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash'],
        default: 'card',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    payment: {
        paymentIntentId: String,
        paymentStatus: String,
        paymentMethod: String,
        paidAmount: Number,
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    preparationTime: Number,
    customerNotes: String,
    driverNotes: String,
    cancellationReason: String,
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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

// Middleware to update statusHistory when status changes
orderSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
        } as IStatusHistory);
    }
    this.updatedAt = new Date();
    next();
});

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
