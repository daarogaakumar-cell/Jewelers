import { z } from "zod";

const metalVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required").trim(),
  purity: z.number().min(0).max(100, "Purity must be between 0 and 100"),
  pricePerGram: z.number().min(0, "Price must be non-negative"),
  unit: z.enum(["gram", "tola", "ounce"]).default("gram"),
});

export const metalCreateSchema = z.object({
  name: z.string().min(1, "Metal name is required").max(50).trim(),
  variants: z
    .array(metalVariantSchema)
    .min(1, "At least one variant is required"),
  isActive: z.boolean().optional().default(true),
});

export const metalUpdateSchema = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  variants: z.array(metalVariantSchema).min(1).optional(),
  isActive: z.boolean().optional(),
});

export const metalPriceUpdateSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  newPrice: z.number().min(0, "Price must be non-negative"),
});

export type MetalCreateInput = z.infer<typeof metalCreateSchema>;
export type MetalFormValues = z.input<typeof metalCreateSchema>;
export type MetalUpdateInput = z.infer<typeof metalUpdateSchema>;
export type MetalPriceUpdateInput = z.infer<typeof metalPriceUpdateSchema>;
export type MetalVariantInput = z.infer<typeof metalVariantSchema>;
