"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageSpinner } from "@/components/ui/Spinner";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<{
    _id: string;
    name: string;
    image: string;
    description?: string;
    order?: number;
    isActive?: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories/${id}`);
        const data = await res.json();
        if (data.success) {
          setCategory(data.data);
        } else {
          toast.error("Category not found");
        }
      } catch {
        toast.error("Failed to load category");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  if (isLoading) return <PageSpinner />;
  if (!category) return null;

  return <CategoryForm mode="edit" initialData={category} />;
}
