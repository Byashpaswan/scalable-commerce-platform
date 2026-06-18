import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  versionKey: false
});

export const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
