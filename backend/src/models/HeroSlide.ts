import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroSlide extends Document {
  imageUrl: string;
  publicId: string;
  ctaLink: string;
  altText?: string;
  order: number;
  isActive: boolean;
}

const HeroSlideSchema = new Schema<IHeroSlide>(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    ctaLink: { type: String, default: '' },
    altText: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const HeroSlide = mongoose.model<IHeroSlide>('HeroSlide', HeroSlideSchema);
export default HeroSlide;
