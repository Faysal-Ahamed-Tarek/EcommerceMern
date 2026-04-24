import { z } from 'zod';

const variantSchema = z
  .object({
    type: z.string().min(1),
    name: z.string().min(1),
    price: z.number().positive(),
    discountPrice: z.number().min(0),
    stock: z.number().int().min(0).optional(),
  })
  .refine((v) => v.discountPrice <= v.price, {
    message: 'discountPrice must be <= price',
    path: ['discountPrice'],
  });

export const createProductSchema = z
  .object({
    title: z.string().min(2).max(200),
    description: z.string().min(1),
    shortDescription: z.string().optional(),
    howToUse: z.string().optional(),
    ingredients: z.string().optional(),
    sku: z.string().optional(),
    category: z.string().min(1),
    images: z
      .array(
        z.object({
          cloudinaryUrl: z.string().url(),
          publicId: z.string().min(1),
        })
      )
      .min(1),
    variants: z.array(variantSchema).optional(),
    basePrice: z.number().min(0).optional(),
    DiscountPrice: z.number().min(0).optional(),
    totalStock: z.number().int().min(0).optional(),
    isFeatured: z.boolean().optional(),
    isTopSelling: z.boolean().optional(),
    status: z.enum(['draft', 'published']).optional(),
    metaTitle: z.string().max(120).optional(),
    metaDescription: z.string().max(320).optional(),
    metaKeywords: z.string().max(500).optional(),
    ogImage: z.string().optional(),
    canonicalUrl: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasVariants = data.variants && data.variants.length > 0;
      if (!hasVariants) {
        return data.basePrice !== undefined && data.basePrice > 0;
      }
      return true;
    },
    { message: 'basePrice is required when product has no variants', path: ['basePrice'] }
  );

export const updateProductSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().optional(),
  howToUse: z.string().optional(),
  ingredients: z.string().optional(),
  sku: z.string().optional(),
  category: z.string().min(1).optional(),
  images: z
    .array(
      z.object({
        cloudinaryUrl: z.string().url(),
        publicId: z.string().min(1),
      })
    )
    .min(1)
    .optional(),
  variants: z.array(variantSchema).optional(),
  basePrice: z.number().min(0).optional(),
  DiscountPrice: z.number().min(0).optional(),
  totalStock: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isTopSelling: z.boolean().optional(),
  status: z.enum(['draft', 'published']).optional(),
  metaTitle: z.string().max(120).optional(),
  metaDescription: z.string().max(320).optional(),
  metaKeywords: z.string().max(500).optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['latest', 'price_asc', 'price_desc']).optional(),
  status: z.enum(['draft', 'published']).optional(),
});
