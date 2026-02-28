"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, IndianRupee, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { fadeIn } from "@/lib/animations";

const customerFormSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(10, "Valid phone number required").max(15),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional().default(""),
  totalDebt: z.number().min(0, "Debt cannot be negative").default(0),
  notes: z.string().optional().default(""),
});

type CustomerFormValues = z.output<typeof customerFormSchema>;

export default function NewCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(customerFormSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      totalDebt: 0,
      notes: "",
    },
  });

  const onSubmit = async (values: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Customer created!");
        router.push("/admin/customers");
      } else {
        toast.error(data.error || "Failed to create customer");
      }
    } catch {
      toast.error("Failed to create customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Customers", href: "/admin/customers" },
          { label: "Add Customer" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-heading font-bold text-charcoal-700">
          Add Customer
        </h1>
        <p className="text-sm text-charcoal-400 mt-1">
          Register a new customer and optionally set their initial debt
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <motion.div variants={fadeIn} initial="initial" animate="animate">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} className="text-gold-500" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  placeholder="Enter customer name"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  label="Phone Number *"
                  placeholder="10-digit mobile number"
                  error={errors.phone?.message}
                  {...register("phone")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  placeholder="customer@email.com"
                  type="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  label="Address"
                  placeholder="Customer address"
                  {...register("address")}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee size={18} className="text-gold-500" />
                Initial Debt (Optional)
              </CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4">
              <Input
                label="Opening Debt Amount (₹)"
                placeholder="0"
                type="number"
                step="0.01"
                min="0"
                error={errors.totalDebt?.message}
                {...register("totalDebt", { valueAsNumber: true })}
              />
              <p className="text-xs text-charcoal-400">
                Set any pre-existing debt amount for this customer. Leave at 0 if no debt.
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={18} className="text-gold-500" />
                Notes
              </CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 md:px-6 md:pb-6">
              <Textarea
                label="Notes"
                placeholder="Any additional information about this customer..."
                rows={3}
                {...register("notes")}
              />
            </div>
          </Card>
        </motion.div>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Add Customer"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/customers")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
