import { Metadata } from "next";
import { GemstoneForm } from "@/components/admin/GemstoneForm";

export const metadata: Metadata = {
  title: "Add Gemstone",
};

export default function AddGemstonePage() {
  return <GemstoneForm mode="create" />;
}
