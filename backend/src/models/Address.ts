import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Schema.Types.ObjectId;
  name: string; // e.g., "Home", "Work", "Mom's House"
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
  deliveryInstructions?: string;
  contactName?: string;
  contactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    default: 'USA',
    trim: true,
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  deliveryInstructions: {
    type: String,
    trim: true,
  },
  contactName: {
    type: String,
    trim: true,
  },
  contactPhone: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
addressSchema.index({ user: 1 });
addressSchema.index({ user: 1, isDefault: 1 });

const Address = mongoose.model<IAddress>('Address', addressSchema);
export default Address;
