import { z } from 'zod';

const variantSchema = z
  .object({
    weight_label: z.string().min(1),
    base_price: z.number().min(0),
    discount_price: z.number().min(0).optional(),
    stock: z.number().int().min(0),
  })
  .refine(
    (v) => v.discount_price === undefined || v.discount_price <= v.base_price,
    {
      message: 'discount_price must be <= base_price',
      path: ['discount_price'],
    }
  );

export const createProductSchema = z
  .object({
    title_en: z.string().min(2).max(200),
    title_bn: z.string().optional(),
    description: z.string().min(1),
    shortDescription: z.string().optional(),
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
    metaTitle: z.union([z.string().min(5).max(60), z.literal("")]).optional(),
    metaDescription: z.union([z.string().min(10).max(320), z.literal("")]).optional(),
    metaKeywords: z.string().max(500).optional(),
    ogImage: z.union([z.string().url(), z.literal("")]).optional(),
    canonicalUrl: z.union([z.string().url(), z.literal("")]).optional(),
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
  title_en: z.string().min(2).max(200).optional(),
  title_bn: z.string().optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().optional(),
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
  metaTitle: z.union([z.string().min(5).max(60), z.literal("")]).optional(),
  metaDescription: z.union([z.string().min(10).max(320), z.literal("")]).optional(),
  metaKeywords: z.string().max(500).optional(),
  ogImage: z.union([z.string().url(), z.literal("")]).optional(),
  canonicalUrl: z.union([z.string().url(), z.literal("")]).optional(),
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
