import { Metadata } from "next";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin dashboard overview for Abhishek Jewelers",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
