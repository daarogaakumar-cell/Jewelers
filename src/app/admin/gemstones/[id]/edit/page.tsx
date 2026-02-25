"use client";

import { useState, useEffect, use } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { GemstoneForm } from "@/components/admin/GemstoneForm";

export default function EditGemstonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [gemstone, setGemstone] = useState<{
    _id: string;
    name: string;
    variants: Array<{
      _id: string;
      name: string;
      cut?: string;
      clarity?: string;
      color?: string;
      pricePerCarat: number;
      unit: string;
    }>;
    isActive: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGemstone() {
      try {
        const res = await fetch(`/api/gemstones/${id}`);
        const data = await res.json();
        if (data.success) {
          setGemstone(data.data);
        }
      } catch {
        // Error handled by empty state
      } finally {
        setIsLoading(false);
      }
    }
    fetchGemstone();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!gemstone) {
    return (
      <div className="text-center py-20">
        <p className="text-charcoal-400">Gemstone not found</p>
      </div>
    );
  }

  return <GemstoneForm initialData={gemstone} mode="edit" />;
}
