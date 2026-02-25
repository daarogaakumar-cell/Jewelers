"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { GENDER_OPTIONS } from "@/constants";

const basicInfoSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  gender: z.enum(["men", "women", "unisex", "kids"]),
});

export type BasicInfoData = z.infer<typeof basicInfoSchema>;

interface StepBasicInfoProps {
  data: BasicInfoData;
  onChange: (data: BasicInfoData) => void;
  categories: Array<{ _id: string; name: string; slug: string }>;
  onNext: () => void;
}

export function StepBasicInfo({
  data,
  onChange,
  categories,
  onNext,
}: StepBasicInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: data,
  });

  const onSubmit = (values: BasicInfoData) => {
    onChange(values);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <div className="p-5 md:p-6 space-y-5">
          <h2 className="text-lg font-semibold text-charcoal-700">
            Basic Information
          </h2>

          <Input
            label="Product Name"
            placeholder="e.g., Gold Diamond Ring"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              error={errors.category?.message}
              options={categories.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              placeholder="Select category"
              {...register("category")}
            />

            <Select
              label="Gender"
              error={errors.gender?.message}
              options={[...GENDER_OPTIONS]}
              {...register("gender")}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Detailed description of the product..."
            error={errors.description?.message}
            {...register("description")}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="primary">
          Continue to Composition
        </Button>
      </div>
    </form>
  );
}
