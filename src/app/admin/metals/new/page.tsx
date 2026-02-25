import { Metadata } from "next";
import { MetalForm } from "@/components/admin/MetalForm";

export const metadata: Metadata = {
  title: "Add Metal",
};

export default function AddMetalPage() {
  return <MetalForm mode="create" />;
}
