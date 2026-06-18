import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method: 'STRIPE' | 'PAYPAL' | 'COD';
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  orderId: { type: Schema.Types.ObjectId, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD' },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  method: {
    type: String,
    enum: ['STRIPE', 'PAYPAL', 'COD'],
    required: true,
    default: 'STRIPE'
  },
  transactionId: { type: String, unique: true, sparse: true, index: true },
  gatewayResponse: { type: Schema.Types.Mixed }
}, {
  timestamps: true,
  versionKey: false
});

export const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);
export default Payment;
