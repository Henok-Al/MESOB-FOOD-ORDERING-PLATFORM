import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupOrderParticipant extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  items: Array<{
    product: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  subtotal: number;
  status: 'joining' | 'ordering' | 'ready' | 'paid';
  joinedAt: Date;
  paidAt?: Date;
}

export interface IGroupOrder extends Document {
  host: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  groupOrderId: string; // Unique shareable ID
  name: string; // e.g., "John's Birthday Dinner"
  description?: string;
  participants: IGroupOrderParticipant[];
  items: Array<{
    product: mongoose.Types.ObjectId;
    participant: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  status: 'active' | 'ordering' | 'placed' | 'cancelled';
  deadline?: Date; // When orders must be placed by
  isPublic: boolean; // Can anyone join or invite-only
  maxParticipants?: number;
  shareLink: string;
  settings: {
    allowLateJoin: boolean;
    splitBillEqually: boolean;
    hostPaysAll: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GroupOrderParticipantSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: String,
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
      specialInstructions: String,
    },
  ],
  subtotal: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['joining', 'ordering', 'ready', 'paid'],
    default: 'joining',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: Date,
});

const GroupOrderSchema: Schema = new Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    groupOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    participants: [GroupOrderParticipantSchema],
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        participant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        name: String,
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        specialInstructions: String,
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    tip: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'ordering', 'placed', 'cancelled'],
      default: 'active',
    },
    deadline: Date,
    isPublic: {
      type: Boolean,
      default: false,
    },
    maxParticipants: Number,
    shareLink: {
      type: String,
      required: true,
    },
    settings: {
      allowLateJoin: { type: Boolean, default: true },
      splitBillEqually: { type: Boolean, default: false },
      hostPaysAll: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
GroupOrderSchema.index({ status: 1, createdAt: -1 });
GroupOrderSchema.index({ host: 1, status: 1 });

// Method to calculate totals
GroupOrderSchema.methods.calculateTotals = function () {
  let subtotal = 0;
  this.items.forEach((item: any) => {
    subtotal += item.price * item.quantity;
  });

  // Calculate per-participant subtotals
  this.participants.forEach((participant: any) => {
    let participantSubtotal = 0;
    participant.items.forEach((item: any) => {
      participantSubtotal += item.price * item.quantity;
    });
    participant.subtotal = participantSubtotal;
  });

  this.subtotal = subtotal;
  this.tax = subtotal * 0.08; // 8% tax
  this.total = this.subtotal + this.tax + this.deliveryFee + this.tip;
};

export const GroupOrderParticipant = mongoose.model<IGroupOrderParticipant>(
  'GroupOrderParticipant',
  GroupOrderParticipantSchema
);
export default mongoose.model<IGroupOrder>('GroupOrder', GroupOrderSchema);
