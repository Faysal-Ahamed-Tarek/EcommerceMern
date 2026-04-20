import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteConfig extends Document {
  primaryColor: string;
}

const SiteConfigSchema = new Schema<ISiteConfig>(
  {
    primaryColor: { type: String, default: '#16a34a' },
  },
  { timestamps: true }
);

const SiteConfig = mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);
export default SiteConfig;
