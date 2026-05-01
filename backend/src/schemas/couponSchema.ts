import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(1).max(50).trim().toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  applicableProducts: z.array(z.string()).optional().default([]),
  maxUsageCount: z.number().int().positive().optional(),
  minOrderAmount: z.number().min(0).optional(),
  expiryDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const applyCouponSchema = z.object({
  couponCode: z.string().min(1).trim().toUpperCase(),
  cartTotal: z.number().positive(),
  productSlugs: z.array(z.string()).default([]),
});
