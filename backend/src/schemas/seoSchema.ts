import { z } from 'zod';

export const updateSEOSchema = z
  .object({
    title: z.string().min(5).max(60).trim(),
    description: z.string().min(10).max(320).trim(),
    canonicalUrl: z.string().url().optional().or(z.literal('')),
    ogImage: z.string().url().optional().or(z.literal('')),
    keywords: z.string().max(200).optional(),
  })
  .refine((data) => data.title && data.description, {
    message: 'Title and description are required',
  });
