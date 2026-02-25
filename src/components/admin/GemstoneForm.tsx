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
import {
  gemstoneCreateSchema,
  type GemstoneFormValues,
} from "@/lib/validators/gemstone";
import { GEMSTONE_UNITS } from "@/constants";

interface GemstoneFormProps {
  initialData?: {
    _id: string;
    name: string;
    variants: Array<{
      _id?: string;
      name: string;
      cut?: string;
      clarity?: string;
      color?: string;
      pricePerCarat: number;
      unit: string;
    }>;
    isActive: boolean;
  };
  mode: "create" | "edit";
}

export function GemstoneForm({ initialData, mode }: GemstoneFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GemstoneFormValues>({
    resolver: zodResolver(gemstoneCreateSchema),
    defaultValues: {
      name: initialData?.name || "",
      variants: initialData?.variants?.map((v) => ({
        name: v.name,
        cut: v.cut || "",
        clarity: v.clarity || "",
        color: v.color || "",
        pricePerCarat: v.pricePerCarat,
        unit: v.unit as "carat" | "ratti" | "cent",
      })) || [
        {
          name: "",
          cut: "",
          clarity: "",
          color: "",
          pricePerCarat: 0,
          unit: "carat" as const,
        },
      ],
      isActive: initialData?.isActive ?? true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const onSubmit = async (data: GemstoneFormValues) => {
    setIsSubmitting(true);
    try {
      const url =
        mode === "edit"
          ? `/api/gemstones/${initialData?._id}`
          : "/api/gemstones";
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
            ? "Gemstone updated successfully"
            : "Gemstone created successfully"
        );
        router.push("/admin/gemstones");
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
          { label: "Gemstones", href: "/admin/gemstones" },
          { label: mode === "edit" ? "Edit Gemstone" : "Add Gemstone" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-heading font-bold text-charcoal-700">
          {mode === "edit" ? "Edit Gemstone" : "Add New Gemstone"}
        </h1>
        <p className="text-sm text-charcoal-400 mt-1">
          {mode === "edit"
            ? "Update gemstone details and variant prices"
            : "Add a new gemstone with its variants and pricing"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <div className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-charcoal-700 mb-4">
              Gemstone Details
            </h2>
            <div className="max-w-md">
              <Input
                label="Gemstone Name"
                placeholder="e.g., Diamond, Ruby, Emerald"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>
          </div>
        </Card>

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
                    cut: "",
                    clarity: "",
                    color: "",
                    pricePerCarat: 0,
                    unit: "carat",
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input
                      label="Variant Name"
                      placeholder="e.g., VVS1, AAA, IF"
                      error={errors.variants?.[index]?.name?.message}
                      {...register(`variants.${index}.name`)}
                    />
                    <Input
                      label="Cut"
                      placeholder="e.g., Round, Princess"
                      error={errors.variants?.[index]?.cut?.message}
                      {...register(`variants.${index}.cut`)}
                    />
                    <Input
                      label="Clarity"
                      placeholder="e.g., VVS1, VS2, SI1"
                      error={errors.variants?.[index]?.clarity?.message}
                      {...register(`variants.${index}.clarity`)}
                    />
                    <Input
                      label="Color"
                      placeholder="e.g., D, E, F"
                      error={errors.variants?.[index]?.color?.message}
                      {...register(`variants.${index}.color`)}
                    />
                    <Input
                      label="Price per Carat (₹)"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 45000"
                      error={
                        errors.variants?.[index]?.pricePerCarat?.message
                      }
                      {...register(`variants.${index}.pricePerCarat`, {
                        valueAsNumber: true,
                      })}
                    />
                    <Select
                      label="Unit"
                      error={errors.variants?.[index]?.unit?.message}
                      {...register(`variants.${index}.unit`)}
                    >
                      {GEMSTONE_UNITS.map((unit) => (
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

        <div className="flex items-center gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mode === "edit" ? "Update Gemstone" : "Create Gemstone"}
          </Button>
        </div>
      </form>
    </div>
  );
}
