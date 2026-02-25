import { Metadata } from "next";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = {
  title: "Add Category | Abhishek Jewelers",
};

export default function NewCategoryPage() {
  return <CategoryForm mode="create" />;
}
