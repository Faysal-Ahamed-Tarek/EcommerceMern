import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLink {
  platform: string;
  url: string;
  isActive: boolean;
}

export interface ITrustBadge {
  icon: string;
  title: string;
  desc: string;
}

export interface IDeliveryZone {
  label: string;
  charge: number;
}

export interface ISiteConfig extends Document {
  primaryColor: string;
  storeName?: string;
  storeTagline?: string;
  siteTitle?: string;
  favicon?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  storeLogo?: string;
  marqueeEnabled: boolean;
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
  homeCategories: string[];
  trustBadges: ITrustBadge[];
  deliveryZones: IDeliveryZone[];
  // SEO site defaults
  siteUrl?: string;
  defaultOgImage?: string;
  defaultMetaDescription?: string;
  headerPhone?: string;
  // Admin panel branding
  adminPanelName?: string;
  adminPanelLogo?: string;
}

const SiteConfigSchema = new Schema<ISiteConfig>(
  {
    primaryColor: { type: String, default: '#16a34a' },
    storeName: { type: String },
    storeTagline: { type: String },
    siteTitle: { type: String },
    favicon: { type: String },
    storeAddress: { type: String },
    storePhone: { type: String },
    storeEmail: { type: String },
    storeLogo: { type: String },
    marqueeEnabled: { type: Boolean, default: true },
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
    homeCategories: { type: [String], default: [] },
    deliveryZones: {
      type: [{ label: { type: String, required: true }, charge: { type: Number, required: true } }],
      default: [
        { label: 'Inside Dhaka', charge: 60 },
        { label: 'Outside Dhaka', charge: 120 },
      ],
    },
    trustBadges: {
      type: [{ icon: { type: String, required: true }, title: { type: String, required: true }, desc: { type: String, required: true } }],
      default: [
        { icon: 'Truck', title: 'Free Delivery', desc: 'On orders above ৳999' },
        { icon: 'Leaf', title: '100% Natural', desc: 'Sourced from trusted farms' },
        { icon: 'ShieldCheck', title: 'Secure Payment', desc: 'Cash on delivery available' },
        { icon: 'RotateCcw', title: 'Easy Returns', desc: '7-day hassle-free returns' },
      ],
    },
    siteUrl: { type: String },
    defaultOgImage: { type: String },
    defaultMetaDescription: { type: String },
    headerPhone: { type: String },
    adminPanelName: { type: String },
    adminPanelLogo: { type: String },
  },
  { timestamps: true }
);

const SiteConfig = mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);
export default SiteConfig;
