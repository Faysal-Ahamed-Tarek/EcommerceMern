import { z } from 'zod';

export const createOrderSchema = z.object({
  note: z.string().max(500).optional(),
  customerName: z.string().min(2).max(100),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid phone number'),
  address: z.string().min(5).max(300),
  items: z
    .array(
      z.object({
        productSlug: z.string().min(1),
        title: z.string().min(1),
        variant: z.string().min(1),
        price: z.number().positive(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  totalAmount: z.number().positive(),
  paymentMethod: z.literal('cod'),
});
