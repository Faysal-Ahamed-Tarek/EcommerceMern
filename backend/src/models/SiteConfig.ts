import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLink {
  platform: string;
  url: string;
  isActive: boolean;
}

export interface ISiteConfig extends Document {
  primaryColor: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  storeLogo?: string;
  marqueeTexts: string[];
  headerLogo?: string;
  footerLogo?: string;
  footerDescription?: string;
  socialLinks: ISocialLink[];
  copyrightText?: string;
  paymentMethodsText?: string;
  footerPhone?: string;
  footerEmail?: string;
  footerLocation?: string;
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
    headerLogo: { type: String },
    footerLogo: { type: String },
    footerDescription: { type: String, default: 'Your trusted marketplace for fresh, organic, and quality products. Delivered across Bangladesh with love.' },
    socialLinks: {
      type: [
        {
          platform: { type: String, required: true },
          url: { type: String, required: true },
          isActive: { type: Boolean, default: true },
        },
      ],
      default: [],
    },
    copyrightText: { type: String, default: '© {year} ShopBD. All rights reserved.' },
    paymentMethodsText: { type: String, default: 'Payment: Cash on Delivery 💵' },
    footerPhone: { type: String, default: '+880 1XXX-XXXXXX' },
    footerEmail: { type: String, default: 'support@shopbd.com' },
    footerLocation: { type: String, default: 'Dhaka, Bangladesh' },
  },
  { timestamps: true }
);

const SiteConfig = mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);
export default SiteConfig;
