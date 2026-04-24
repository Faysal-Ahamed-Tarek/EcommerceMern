import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductVariant {
  type: string;
  name: string;
  price: number;
  discountPrice: number;
  stock?: number;
}

export interface IProductImage {
  cloudinaryUrl: string;
  publicId: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  howToUse?: string;
  ingredients?: string;
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
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
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
        type: { type: String, required: true, default: 'weight' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number, required: true, default: 0 },
        stock: { type: Number },
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
    shortDescription: { type: String },
    howToUse: { type: String },
    ingredients: { type: String },
    sku: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    ogImage: { type: String },
    canonicalUrl: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1 });

ProductSchema.pre('save', async function () {
  if (!this.isModified('title') && this.slug) return;

  const base = this.title
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
