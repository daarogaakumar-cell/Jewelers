import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  image: z.string().url("Valid image URL is required"),
  description: z.string().max(500).optional().default(""),
  order: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
