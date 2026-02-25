"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { metalCreateSchema, type MetalFormValues } from "@/lib/validators/metal";
import { METAL_UNITS } from "@/constants";

interface MetalFormProps {
  initialData?: {
    _id: string;
    name: string;
    variants: Array<{
      _id?: string;
      name: string;
      purity: number;
      pricePerGram: number;
      unit: string;
    }>;
    isActive: boolean;
  };
  mode: "create" | "edit";
}

export function MetalForm({ initialData, mode }: MetalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MetalFormValues>({
    resolver: zodResolver(metalCreateSchema),
    defaultValues: {
      name: initialData?.name || "",
      variants: initialData?.variants?.map((v) => ({
        name: v.name,
        purity: v.purity,
        pricePerGram: v.pricePerGram,
        unit: v.unit as "gram" | "tola" | "ounce",
      })) || [{ name: "", purity: 0, pricePerGram: 0, unit: "gram" as const }],
      isActive: initialData?.isActive ?? true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const onSubmit = async (data: MetalFormValues) => {
    setIsSubmitting(true);
    try {
      const url =
        mode === "edit" ? `/api/metals/${initialData?._id}` : "/api/metals";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(
          mode === "edit"
            ? "Metal updated successfully"
            : "Metal created successfully"
        );
        router.push("/admin/metals");
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Metals", href: "/admin/metals" },
          { label: mode === "edit" ? "Edit Metal" : "Add Metal" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-heading font-bold text-charcoal-700">
          {mode === "edit" ? "Edit Metal" : "Add New Metal"}
        </h1>
        <p className="text-sm text-charcoal-400 mt-1">
          {mode === "edit"
            ? "Update metal details and variant prices"
            : "Add a new metal with its variants and pricing"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Card>
          <div className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-charcoal-700 mb-4">
              Metal Details
            </h2>
            <div className="max-w-md">
              <Input
                label="Metal Name"
                placeholder="e.g., Gold, Silver, Platinum"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>
          </div>
        </Card>

        {/* Variants */}
        <Card>
          <div className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-charcoal-700">
                Variants
              </h2>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  append({
                    name: "",
                    purity: 0,
                    pricePerGram: 0,
                    unit: "gram",
                  })
                }
              >
                <Plus size={16} />
                Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-xl border border-charcoal-100 bg-charcoal-50/30 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-charcoal-500">
                      Variant {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-charcoal-400 hover:text-error h-8 w-8 min-w-0"
                        aria-label="Remove variant"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                      label="Variant Name"
                      placeholder="e.g., 24K, 22K, 18K"
                      error={errors.variants?.[index]?.name?.message}
                      {...register(`variants.${index}.name`)}
                    />
                    <Input
                      label="Purity (%)"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 99.9"
                      error={errors.variants?.[index]?.purity?.message}
                      {...register(`variants.${index}.purity`, {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      label="Price per Gram (₹)"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 6200"
                      error={errors.variants?.[index]?.pricePerGram?.message}
                      {...register(`variants.${index}.pricePerGram`, {
                        valueAsNumber: true,
                      })}
                    />
                    <Select
                      label="Unit"
                      error={errors.variants?.[index]?.unit?.message}
                      {...register(`variants.${index}.unit`)}
                    >
                      {METAL_UNITS.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            {errors.variants?.root?.message && (
              <p className="text-sm text-error mt-2">
                {errors.variants.root.message}
              </p>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mode === "edit" ? "Update Metal" : "Create Metal"}
          </Button>
        </div>
      </form>
    </div>
  );
}
