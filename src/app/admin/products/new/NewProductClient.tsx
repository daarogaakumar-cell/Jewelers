"use client";

import { useId, useEffect } from "react";
import { ProductForm } from "@/components/admin/ProductForm";

/**
 * Wraps ProductForm with a unique key so React fully remounts the form
 * every time the user navigates to /admin/products/new.
 * This ensures all form state (steps, data, success screen) resets properly.
 */
export function NewProductClient() {
  // useId generates a stable ID per mount — when the route re-renders via
  // client navigation the component tree is reused, so we also include
  // a timestamp to guarantee a fresh key on every navigation.
  const id = useId();

  // Scroll to top when the form mounts (client-side navigation doesn't auto-scroll)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return <ProductForm key={`create-${id}-${Date.now()}`} mode="create" />;
}
