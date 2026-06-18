import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantSku: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  idempotencyKey: string;
  items: IOrderItem[];
  pricing: {
    subTotal: number;
    tax: number;
    shippingFee: number;
    discount: number;
    grandTotal: number;
  };
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  status: 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentId?: mongoose.Types.ObjectId;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, required: true },
  variantSku: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, required: true, index: true },
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  items: [orderItemSchema],
  pricing: {
    subTotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true }
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING_PAYMENT'
  },
  paymentId: { type: Schema.Types.ObjectId },
  trackingNumber: { type: String }
}, {
  timestamps: true,
  versionKey: false
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
