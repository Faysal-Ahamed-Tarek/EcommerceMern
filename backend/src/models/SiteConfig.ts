import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteConfig extends Document {
  primaryColor: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  storeLogo?: string;
  marqueeTexts: string[];
}

const SiteConfigSchema = new Schema<ISiteConfig>(
  {
    primaryColor: { type: String, default: '#16a34a' },
    storeName: { type: String },
    storeAddress: { type: String },
    storePhone: { type: String },
    storeEmail: { type: String },
    storeLogo: { type: String },
    marqueeTexts: {
      type: [String],
      default: [
        '🚚 Free delivery on orders above ৳999',
        'Cash on Delivery available across Bangladesh',
      ],
    },
  },
  { timestamps: true }
);

const SiteConfig = mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);
export default SiteConfig;
