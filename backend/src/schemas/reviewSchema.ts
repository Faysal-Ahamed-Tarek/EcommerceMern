import { z } from 'zod';

export const createReviewSchema = z.object({
  productSlug: z.string().min(1),
  orderId: z.string().min(1),
  customerName: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});
