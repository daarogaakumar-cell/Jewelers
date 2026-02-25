"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { GENDER_OPTIONS } from "@/constants";

export function CategoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentGender = searchParams.get("gender") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-charcoal-100 bg-white p-3 shadow-sm sm:p-4">
      <SlidersHorizontal className="h-4 w-4 text-charcoal-400" />

      {/* Gender Filter */}
      <select
        value={currentGender}
        onChange={(e) => updateFilter("gender", e.target.value)}
        className="h-9 rounded-lg border border-charcoal-200 bg-white px-3 text-sm text-charcoal-600 transition-colors focus:border-gold-500 focus:outline-none"
      >
        <option value="">All Genders</option>
        {GENDER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={currentSort}
        onChange={(e) => updateFilter("sort", e.target.value)}
        className="h-9 rounded-lg border border-charcoal-200 bg-white px-3 text-sm text-charcoal-600 transition-colors focus:border-gold-500 focus:outline-none"
      >
        <option value="newest">Newest First</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>

      {/* Clear Filters */}
      {(currentGender || currentSort !== "newest") && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs font-medium text-gold-600 hover:text-gold-700"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
