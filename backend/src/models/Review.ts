import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productSlug: string;
  isVerifiedPurchase: boolean;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ReviewSchema = new Schema<IReview>(
  {
    productSlug: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: false },
    orderId: { type: String, required: true },
    customerName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ productSlug: 1 });
ReviewSchema.index({ status: 1 });

const Review = mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
