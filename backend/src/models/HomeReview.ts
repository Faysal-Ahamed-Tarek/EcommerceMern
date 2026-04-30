import mongoose, { Schema, Document } from 'mongoose';

export interface IHomeReview extends Document {
  customerName: string;
  rating: number;
  comment: string;
  reviewerPhoto?: string;
  imageUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  order: number;
}

const HomeReviewSchema = new Schema<IHomeReview>(
  {
    customerName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    reviewerPhoto: { type: String },
    imageUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

HomeReviewSchema.index({ isActive: 1, order: 1 });

const HomeReview = mongoose.model<IHomeReview>('HomeReview', HomeReviewSchema);
export default HomeReview;
