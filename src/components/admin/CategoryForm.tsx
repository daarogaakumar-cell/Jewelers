"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { categoryCreateSchema } from "@/lib/validators/category";

type CategoryFormValues = z.output<typeof categoryCreateSchema>;

interface CategoryFormProps {
  initialData?: {
    _id: string;
    name: string;
    image: string;
    description?: string;
    order?: number;
    isActive?: boolean;
  };
  mode: "create" | "edit";
}

export function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categoryCreateSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      image: initialData?.image || "",
      description: initialData?.description || "",
      order: initialData?.order ?? 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const imageValue = watch("image");

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      const url =
        mode === "edit"
          ? `/api/categories/${initialData?._id}`
          : "/api/categories";
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
            ? "Category updated successfully"
            : "Category created successfully"
        );
        router.push("/admin/categories");
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
          { label: "Categories", href: "/admin/categories" },
          { label: mode === "edit" ? "Edit Category" : "Add Category" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-heading font-bold text-charcoal-700">
          {mode === "edit" ? "Edit Category" : "Add New Category"}
        </h1>
        <p className="text-sm text-charcoal-400 mt-1">
          {mode === "edit"
            ? "Update category details and image"
            : "Create a new product category with an image"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Image */}
          <Card>
            <div className="p-5 md:p-6">
              <h2 className="text-lg font-semibold text-charcoal-700 mb-4">
                Category Image
              </h2>
              <ImageUpload
                value={imageValue}
                onChange={(url) => setValue("image", url, { shouldValidate: true })}
                onRemove={() => setValue("image", "", { shouldValidate: true })}
                folder="categories"
                aspectRatio="portrait"
                error={errors.image?.message}
              />
            </div>
          </Card>

          {/* Right column — Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-5 md:p-6 space-y-5">
                <h2 className="text-lg font-semibold text-charcoal-700">
                  Category Details
                </h2>

                <Input
                  label="Category Name"
                  placeholder="e.g., Rings, Necklaces, Bangles"
                  error={errors.name?.message}
                  {...register("name")}
                />

                <Textarea
                  label="Description"
                  placeholder="Brief description of the category (optional)"
                  error={errors.description?.message}
                  {...register("description")}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Display Order"
                    type="number"
                    placeholder="0"
                    helperText="Lower numbers appear first"
                    error={errors.order?.message}
                    {...register("order", { valueAsNumber: true })}
                  />

                  <div className="flex items-center gap-3 pt-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        {...register("isActive")}
                      />
                      <div className="w-11 h-6 bg-charcoal-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-charcoal-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                      <span className="ms-3 text-sm font-medium text-charcoal-600">
                        Active
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/categories")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mode === "edit" ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </div>
  );
}
