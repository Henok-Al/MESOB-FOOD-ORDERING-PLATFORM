import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  user: mongoose.Schema.Types.ObjectId;
  restaurant?: mongoose.Schema.Types.ObjectId;
  product?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
}, {
  timestamps: true,
});

// Index to prevent duplicate favorites
favoriteSchema.index({ user: 1, restaurant: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });

const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);
export default Favorite;
