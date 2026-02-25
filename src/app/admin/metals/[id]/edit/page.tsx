"use client";

import { useState, useEffect, use } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { MetalForm } from "@/components/admin/MetalForm";

export default function EditMetalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [metal, setMetal] = useState<{
    _id: string;
    name: string;
    variants: Array<{
      _id: string;
      name: string;
      purity: number;
      pricePerGram: number;
      unit: string;
    }>;
    isActive: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetal() {
      try {
        const res = await fetch(`/api/metals/${id}`);
        const data = await res.json();
        if (data.success) {
          setMetal(data.data);
        }
      } catch {
        // Error handled by empty state
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetal();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!metal) {
    return (
      <div className="text-center py-20">
        <p className="text-charcoal-400">Metal not found</p>
      </div>
    );
  }

  return <MetalForm initialData={metal} mode="edit" />;
}
