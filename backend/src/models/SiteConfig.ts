import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteConfig extends Document {
  primaryColor: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  storeLogo?: string;
}

const SiteConfigSchema = new Schema<ISiteConfig>(
  {
    primaryColor: { type: String, default: '#16a34a' },
    storeName: { type: String },
    storeAddress: { type: String },
    storePhone: { type: String },
    storeEmail: { type: String },
    storeLogo: { type: String },
  },
  { timestamps: true }
);

const SiteConfig = mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);
export default SiteConfig;
