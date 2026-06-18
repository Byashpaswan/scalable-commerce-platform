import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttribute {
  name: string;
  value: string;
}

export interface IVariant {
  sku: string;
  price: number;
  attributes: IAttribute[];
  images: string[];
}

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  brand: string;
  images: string[];
  basePrice: number;
  attributes: IAttribute[];
  variants: IVariant[];
  ratings: {
    average: number;
    count: number;
  };
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const attributeSchema = new Schema<IAttribute>({
  name: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const variantSchema = new Schema<IVariant>({
  sku: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  attributes: [attributeSchema],
  images: [{ type: String }]
}, { _id: false });

const productSchema = new Schema<IProduct>({
  sellerId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, required: true, index: true },
  brand: { type: String, required: true },
  images: [{ type: String }],
  basePrice: { type: Number, required: true, min: 0 },
  attributes: [attributeSchema],
  variants: [variantSchema],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'INACTIVE'], default: 'DRAFT' }
}, {
  timestamps: true,
  versionKey: false
});

productSchema.index({ categoryId: 1, status: 1, basePrice: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);
export default Product;
