"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { fadeIn } from "@/lib/animations";

const customerEditSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(10, "Valid phone number required").max(15),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

type CustomerEditValues = z.output<typeof customerEditSchema>;

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerEditValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(customerEditSchema) as any,
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`);
        const data = await res.json();
        if (data.success) {
          const c = data.data;
          setCustomerName(c.name);
          reset({
            name: c.name,
            phone: c.phone,
            email: c.email || "",
            address: c.address || "",
            notes: c.notes || "",
          });
        } else {
          toast.error("Customer not found");
          router.push("/admin/customers");
        }
      } catch {
        toast.error("Failed to load customer");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomer();
  }, [id, reset, router]);

  const onSubmit = async (values: CustomerEditValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Customer updated!");
        router.push(`/admin/customers/${id}`);
      } else {
        toast.error(data.error || "Failed to update customer");
      }
    } catch {
      toast.error("Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Customers", href: "/admin/customers" },
          { label: customerName, href: `/admin/customers/${id}` },
          { label: "Edit" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-heading font-bold text-charcoal-700">
          Edit Customer
        </h1>
        <p className="text-sm text-charcoal-400 mt-1">
          Update customer details. To manage debt, use the customer detail page.
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
                <FileText size={18} className="text-gold-500" />
                Notes
              </CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 md:px-6 md:pb-6">
              <Textarea
                label="Notes"
                placeholder="Any additional information..."
                rows={3}
                {...register("notes")}
              />
            </div>
          </Card>
        </motion.div>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/customers/${id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
