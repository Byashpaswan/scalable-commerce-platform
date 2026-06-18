import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  reorderLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>({
  productId: { type: Schema.Types.ObjectId, required: true, unique: true, index: true },
  sku: { type: String, required: true, unique: true, index: true },
  quantity: { type: Number, required: true, min: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  reorderLevel: { type: Number, default: 10 }
}, {
  timestamps: true,
  versionKey: false
});

export const Inventory: Model<IInventory> = mongoose.model<IInventory>('Inventory', inventorySchema);
export default Inventory;
