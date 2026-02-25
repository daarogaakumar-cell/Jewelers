"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/ProductForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
        } else {
          toast.error("Product not found");
          router.push("/admin/products");
        }
      } catch {
        toast.error("Failed to load product");
        router.push("/admin/products");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Products", href: "/admin/products" },
            { label: "Edit Product" },
          ]}
        />
        <Card>
          <div className="p-8 space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!product) return null;

  return <ProductForm mode="edit" initialData={product} productId={id} />;
}
