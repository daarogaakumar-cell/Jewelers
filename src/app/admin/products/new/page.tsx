import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "Add New Product | Abhishek Jewelers",
  description: "Create a new jewellery product",
};

export default function NewProductPage() {
  return <ProductForm mode="create" />;
}
