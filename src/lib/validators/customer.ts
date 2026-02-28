import { z } from "zod";

export const customerCreateSchema = z.object({
  name: z.string().min(1, "Customer name is required").trim(),
  phone: z
    .string()
    .min(10, "Valid phone number is required")
    .max(15, "Phone number too long")
    .trim(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional().default(""),
  totalDebt: z.number().min(0, "Debt cannot be negative").default(0),
  notes: z.string().optional().default(""),
});

export const customerUpdateSchema = customerCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const debtPaymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  note: z.string().optional().default(""),
});

export const debtAdjustSchema = z.object({
  amount: z.number().min(0, "Amount cannot be negative"),
  note: z.string().optional().default(""),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type DebtPaymentInput = z.infer<typeof debtPaymentSchema>;
export type DebtAdjustInput = z.infer<typeof debtAdjustSchema>;
