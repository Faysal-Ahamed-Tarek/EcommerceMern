import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductVariant {
  weight_label: string;
  base_price: number;
  discount_price?: number;
  stock: number;
}

export interface IProductImage {
  cloudinaryUrl: string;
  publicId: string;
}

export interface IProduct extends Document {
  title_en: string;
  title_bn?: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku?: string;
  category: string;
  images: IProductImage[];
  variants: IProductVariant[];
  basePrice: number;
  DiscountPrice: number;
  totalStock?: number;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  isTopSelling: boolean;
  status: 'draft' | 'published';
  order?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    title_en: { type: String, required: true, trim: true },
    title_bn: { type: String, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    images: [
      {
        cloudinaryUrl: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    variants: [
      {
        weight_label: { type: String, required: true },
        base_price: { type: Number, required: true },
        discount_price: { type: Number },
        stock: { type: Number, required: true, default: 0 },
      },
    ],
    basePrice: { type: Number, default: 0 },
    DiscountPrice: { type: Number, default: 0 },
    totalStock: { type: Number },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isTopSelling: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    order: { type: Number },
    shortDescription: { type: String },
    sku: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    ogImage: { type: String },
    canonicalUrl: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ status: 1, category: 1 });
ProductSchema.index({ status: 1, isFeatured: 1 });
ProductSchema.index({ status: 1, isTopSelling: 1 });
ProductSchema.index({ status: 1, basePrice: 1 });
ProductSchema.index({ status: 1, order: 1 });
ProductSchema.index({ status: 1, category: 1, basePrice: 1 });
ProductSchema.index({ title_en: 'text', title_bn: 'text', description: 'text' });
ProductSchema.index({ title_bn: 1 });

ProductSchema.pre('save', async function () {
  if (!this.isModified('title_en') && this.slug) return;

  const base = this.title_en
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  let slug = base;
  let suffix = 1;
  while (
    await (mongoose.models.Product as Model<IProduct>).exists({
      slug,
      _id: { $ne: this._id },
    })
  ) {
    slug = `${base}-${suffix++}`;
  }
  this.slug = slug;
});

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
