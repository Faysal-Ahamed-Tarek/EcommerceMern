import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableProducts: string[];
  maxUsageCount?: number;
  currentUsageCount: number;
  minOrderAmount?: number;
  expiryDate?: Date;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    applicableProducts: { type: [String], default: [] },
    maxUsageCount: { type: Number, min: 1 },
    currentUsageCount: { type: Number, default: 0 },
    minOrderAmount: { type: Number, min: 0 },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

CouponSchema.index({ code: 1 });

const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;
