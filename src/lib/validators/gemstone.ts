import { z } from "zod";

const gemstoneVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required").trim(),
  cut: z.string().trim().optional().default(""),
  clarity: z.string().trim().optional().default(""),
  color: z.string().trim().optional().default(""),
  pricePerCarat: z.number().min(0, "Price must be non-negative"),
  unit: z.enum(["carat", "ratti", "cent"]).default("carat"),
});

export const gemstoneCreateSchema = z.object({
  name: z.string().min(1, "Gemstone name is required").max(50).trim(),
  variants: z
    .array(gemstoneVariantSchema)
    .min(1, "At least one variant is required"),
  isActive: z.boolean().optional().default(true),
});

export const gemstoneUpdateSchema = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  variants: z.array(gemstoneVariantSchema).min(1).optional(),
  isActive: z.boolean().optional(),
});

export const gemstonePriceUpdateSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  newPrice: z.number().min(0, "Price must be non-negative"),
});

export type GemstoneCreateInput = z.infer<typeof gemstoneCreateSchema>;
export type GemstoneFormValues = z.input<typeof gemstoneCreateSchema>;
export type GemstoneUpdateInput = z.infer<typeof gemstoneUpdateSchema>;
export type GemstonePriceUpdateInput = z.infer<
  typeof gemstonePriceUpdateSchema
>;
export type GemstoneVariantInput = z.infer<typeof gemstoneVariantSchema>;
