import mongoose, { Schema, Document } from 'mongoose';

export interface IDriverLocation extends Document {
  driver: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  heading?: number; // Direction in degrees
  speed?: number; // Speed in km/h
  accuracy?: number; // GPS accuracy in meters
  batteryLevel?: number; // Driver's device battery
  isOnline: boolean;
  lastUpdated: Date;
}

const DriverLocationSchema: Schema = new Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    heading: {
      type: Number,
      min: 0,
      max: 360,
    },
    speed: {
      type: Number,
      min: 0,
    },
    accuracy: {
      type: Number,
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      expires: 3600, // Auto-delete after 1 hour of inactivity
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
DriverLocationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

export default mongoose.model<IDriverLocation>('DriverLocation', DriverLocationSchema);
