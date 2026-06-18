import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  type: 'HOME' | 'WORK' | 'OTHER';
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT' | 'SELLER';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED';
  emailVerified: boolean;
  phoneVerified: boolean;
  avatarUrl?: string;
  addresses: IAddress[];
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  refreshTokenVersion: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  type: {
    type: String,
    enum: ['HOME', 'WORK', 'OTHER'],
    default: 'HOME',
  },
  fullName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true, trim: true, maxlength: 100 },
  lastName: { type: String, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  phoneNumber: { type: String, unique: true, sparse: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'SUPPORT', 'SELLER'],
    default: 'CUSTOMER',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'SUSPENDED'],
    default: 'ACTIVE',
  },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  avatarUrl: { type: String },
  addresses: [addressSchema],
  lastLoginAt: { type: Date },
  passwordChangedAt: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  refreshTokenVersion: { type: Number, default: 1 },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
  versionKey: false,
});

userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
