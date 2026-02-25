import { Metadata } from "next";
import { PricingDashboardContent } from "./PricingDashboardContent";

export const metadata: Metadata = {
  title: "Pricing Dashboard",
  description: "View and manage all metal and gemstone prices",
};

export default function PricingDashboardPage() {
  return <PricingDashboardContent />;
}
