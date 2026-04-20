import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(2).max(200),
  sku: z.string().min(1).max(100),
  description: z.string().min(1),
  category: z.string().min(1),
  images: z
    .array(
      z.object({
        cloudinaryUrl: z.string().url(),
        publicId: z.string().min(1),
      })
    )
    .min(1),
  variants: z.array(
    z.object({
      name: z.string().min(1),
      price: z.number().positive(),
      stock: z.number().int().min(0).optional(),
      sku: z.string().optional(),
    })
  ),
  basePrice: z.number().positive(),
  DiscountPrice: z.number().min(0),
  totalStock: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['latest', 'price_asc', 'price_desc']).optional(),
  status: z.enum(['draft', 'published']).optional(),
});
