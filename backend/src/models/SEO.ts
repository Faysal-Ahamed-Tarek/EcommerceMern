import mongoose, { Schema, Document } from 'mongoose';

export interface ISEO extends Document {
  page: 'homepage' | 'all_products' | 'about' | 'privacy_policy' | 'terms_conditions';
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SEOSchema = new Schema<ISEO>(
  {
    page: {
      type: String,
      required: true,
      unique: true,
      enum: ['homepage', 'all_products', 'about', 'privacy_policy', 'terms_conditions'],
    },
    title: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, required: true, trim: true, maxlength: 320 },
    canonicalUrl: { type: String },
    ogImage: { type: String },
    keywords: { type: String, maxlength: 200 },
  },
  { timestamps: true, collection: 'seo_settings' }
);

const SEO = mongoose.model<ISEO>('SEO', SEOSchema);
export default SEO;
