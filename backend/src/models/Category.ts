import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    restaurant: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
    },
    slug: {
        type: String,
        lowercase: true,
        index: true,
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

categorySchema.pre('save', function (next) {
    if (!this.isModified('name')) return next();
    // @ts-ignore
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
    next();
});

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
