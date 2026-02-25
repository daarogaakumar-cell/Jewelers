"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  CreditCard,
  FileText,
  Percent,
  BadgeIndianRupee,
  CheckCircle2,
  Package,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Skeleton } from "@/components/ui/Skeleton";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { formatCurrency, debounce } from "@/lib/utils";
import { fadeIn } from "@/lib/animations";
import { PAYMENT_MODES } from "@/constants";

const billFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerAddress: z.string().optional().default(""),
  discountType: z.enum(["fixed", "percentage"]).default("fixed"),
  discountValue: z.number().min(0).default(0),
  paymentMode: z
    .enum(["cash", "card", "upi", "bank_transfer"])
    .default("cash"),
  notes: z.string().optional().default(""),
});

type BillFormValues = z.output<typeof billFormSchema>;

interface ProductSearchResult {
  _id: string;
  name: string;
  productCode: string;
  totalPrice: number;
  thumbnailImage: string;
  category?: { name: string } | null;
}

interface BillItem {
  product: ProductSearchResult;
  quantity: number;
}

export default function BillForm() {
  const router = useRouter();

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Bill items (cart)
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  // Discount
  const [discountAmount, setDiscountAmount] = useState(0);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBillId, setCreatedBillId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BillFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(billFormSchema) as any,
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      discountType: "fixed",
      discountValue: 0,
      paymentMode: "cash",
      notes: "",
    },
  });

  const discountType = watch("discountType");
  const discountValue = watch("discountValue");

  // Total across all items
  const itemsTotal = billItems.reduce(
    (sum, item) => sum + item.product.totalPrice * item.quantity,
    0
  );

  // Recalculate discount whenever inputs change
  useEffect(() => {
    if (!billItems.length || !discountValue) {
      setDiscountAmount(0);
      return;
    }
    if (discountType === "percentage") {
      setDiscountAmount(
        Math.round(itemsTotal * (discountValue / 100) * 100) / 100
      );
    } else {
      setDiscountAmount(discountValue);
    }
  }, [discountType, discountValue, itemsTotal, billItems.length]);

  const finalAmount = Math.max(0, itemsTotal - discountAmount);

  // Debounced product search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (query: unknown) => {
      const q = query as string;
      if (!q || q.length < 2) {
        setProductResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(q)}&limit=8`
        );
        const data = await res.json();
        if (data.success) setProductResults(data.data);
      } catch {
        // Silently fail
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(productSearch);
  }, [productSearch, debouncedSearch]);

  /** Add product to cart (or increment qty if already there) */
  const addProduct = (product: ProductSearchResult) => {
    setBillItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setProductSearch("");
    setProductResults([]);
  };

  /** Remove item from cart */
  const removeItem = (productId: string) => {
    setBillItems((prev) => prev.filter((i) => i.product._id !== productId));
    setValue("discountValue", 0);
  };

  /** Change quantity (+1 or -1; removes item when qty reaches 0) */
  const updateQuantity = (productId: string, delta: number) => {
    setBillItems((prev) =>
      prev
        .map((i) =>
          i.product._id === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const onSubmit = async (values: BillFormValues) => {
    if (!billItems.length) {
      toast.error("Please add at least one product");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: billItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        customer: {
          name: values.customerName,
          phone: values.customerPhone,
          email: values.customerEmail || undefined,
          address: values.customerAddress || undefined,
        },
        discount:
          values.discountValue > 0
            ? {
                type: values.discountType,
                value: values.discountValue,
                amount: discountAmount,
              }
            : undefined,
        finalAmount: Math.round(finalAmount * 100) / 100,
        paymentMode: values.paymentMode,
        notes: values.notes,
      };

      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedBillId(data.data._id);
        setIsSuccess(true);
        toast.success(data.message || "Bill created successfully!");
      } else {
        toast.error(data.error || "Failed to create bill");
      }
    } catch {
      toast.error("Failed to create bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  // â”€â”€ Success Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isSuccess && createdBillId) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Bills", href: "/admin/bills" },
            { label: "New Bill" },
          ]}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="text-success" size={40} />
          </motion.div>
          <h2 className="text-xl font-heading font-bold text-charcoal-700">
            Bill Created Successfully!
          </h2>
          <p className="text-charcoal-400 mt-2">
            {billItems.length > 1
              ? `${billItems.length} items â€” bill is ready to download.`
              : "Your bill has been generated."}
          </p>
          <div className="flex gap-3 mt-6 flex-wrap justify-center">
            <a
              href={`/api/bills/${createdBillId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary">
                <FileText size={16} />
                Download PDF
              </Button>
            </a>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/bills")}
            >
              View All Bills
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsSuccess(false);
                setCreatedBillId(null);
                setBillItems([]);
              }}
            >
              Create Another
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // â”€â”€ Main Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Bills", href: "/admin/bills" },
          { label: "New Bill" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-heading font-bold text-charcoal-700">
          Generate Bill
        </h1>
        <p className="text-sm text-charcoal-400 mt-1">
          Add one or more products, then fill in customer details
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* â”€â”€ Left column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Product Search & Items Cart */}
          <motion.div variants={fadeIn} initial="initial" animate="animate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-gold-500" />
                  Bill Items
                  {billItems.length > 0 && (
                    <Badge variant="default" size="sm" className="ml-auto">
                      {billItems.length} item{billItems.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4">

                {/* Search input */}
                <div className="relative">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400"
                    />
                    <input
                      type="text"
                      placeholder="Search & add products by name or codeâ€¦"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full h-11 pl-9 pr-4 rounded-xl border border-charcoal-200 bg-white text-sm text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>

                  {/* Dropdown results */}
                  {(productResults.length > 0 || isSearching) && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-charcoal-100 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 space-y-3">
                          {[0, 1, 2].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : (
                        productResults.map((product) => (
                          <button
                            key={product._id}
                            type="button"
                            onClick={() => addProduct(product)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gold-50 transition-colors border-b border-charcoal-50 last:border-0"
                          >
                            {product.thumbnailImage && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.thumbnailImage}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-charcoal-700 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs font-mono text-charcoal-400">
                                {product.productCode}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <PriceDisplay amount={product.totalPrice} size="sm" />
                              <span className="text-xs text-gold-600 font-semibold border border-gold-300 rounded-full px-2 py-0.5">
                                + Add
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Items list */}
                <AnimatePresence mode="popLayout">
                  {billItems.length > 0 ? (
                    <div className="space-y-2">
                      {billItems.map((item, index) => (
                        <motion.div
                          key={item.product._id}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.04 }}
                          className="flex items-center gap-3 rounded-xl border border-charcoal-100 bg-charcoal-50/40 p-3"
                        >
                          {item.product.thumbnailImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.product.thumbnailImage}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-charcoal-700 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-xs font-mono text-charcoal-400">
                              {item.product.productCode}
                            </p>
                            <p className="text-xs text-charcoal-500 mt-0.5">
                              {formatCurrency(item.product.totalPrice)} Ã—{" "}
                              {item.quantity} ={" "}
                              <span className="font-semibold text-charcoal-700">
                                {formatCurrency(
                                  item.product.totalPrice * item.quantity
                                )}
                              </span>
                            </p>
                          </div>

                          {/* Qty controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.product._id, -1)
                              }
                              className="w-7 h-7 rounded-lg border border-charcoal-200 flex items-center justify-center hover:bg-charcoal-100 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-charcoal-700">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.product._id, 1)
                              }
                              className="w-7 h-7 rounded-lg border border-charcoal-200 flex items-center justify-center hover:bg-charcoal-100 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.product._id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors ml-1 shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-charcoal-100 rounded-xl"
                    >
                      <Package size={32} className="text-charcoal-200 mb-3" />
                      <p className="text-sm text-charcoal-400">
                        No items added yet
                      </p>
                      <p className="text-xs text-charcoal-300 mt-1">
                        Search above to add products
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Customer Details */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={18} className="text-gold-500" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Customer Name *"
                    placeholder="Enter customer name"
                    error={errors.customerName?.message}
                    {...register("customerName")}
                  />
                  <Input
                    label="Phone Number *"
                    placeholder="10-digit mobile number"
                    error={errors.customerPhone?.message}
                    {...register("customerPhone")}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    placeholder="customer@email.com"
                    type="email"
                    error={errors.customerEmail?.message}
                    {...register("customerEmail")}
                  />
                  <Input
                    label="Address"
                    placeholder="Customer address"
                    {...register("customerAddress")}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Payment & Notes */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard size={18} className="text-gold-500" />
                  Payment & Notes
                </CardTitle>
              </CardHeader>
              <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4">
                <Select
                  label="Payment Mode"
                  options={[...PAYMENT_MODES]}
                  {...register("paymentMode")}
                />
                <Textarea
                  label="Notes"
                  placeholder="Any additional notesâ€¦"
                  rows={3}
                  {...register("notes")}
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* â”€â”€ Right column: Price summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeIndianRupee size={18} className="text-gold-500" />
                  Price Summary
                </CardTitle>
              </CardHeader>
              <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4">
                {billItems.length > 0 ? (
                  <>
                    {/* Per-item breakdown */}
                    <div className="space-y-2">
                      {billItems.map((item) => (
                        <div
                          key={item.product._id}
                          className="flex items-start justify-between text-sm gap-2"
                        >
                          <span
                            className="text-charcoal-500 truncate flex-1"
                            title={item.product.name}
                          >
                            {item.product.name}
                            {item.quantity > 1 && (
                              <span className="text-charcoal-400 ml-1">
                                Ã—{item.quantity}
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-charcoal-700 shrink-0">
                            {formatCurrency(
                              item.product.totalPrice * item.quantity
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Items subtotal */}
                    <div className="flex items-center justify-between text-sm border-t border-charcoal-100 pt-3">
                      <span className="text-charcoal-600 font-medium">
                        Items Total
                      </span>
                      <span className="font-mono font-medium text-charcoal-700">
                        {formatCurrency(itemsTotal)}
                      </span>
                    </div>

                    {/* Discount */}
                    <div className="space-y-2 pt-1 border-t border-charcoal-100">
                      <p className="text-sm font-medium text-charcoal-600 flex items-center gap-1">
                        <Percent size={14} />
                        Discount (Optional)
                      </p>
                      <div className="flex gap-2">
                        <Select
                          options={[
                            { value: "fixed", label: "â‚¹ Fixed" },
                            { value: "percentage", label: "% Percent" },
                          ]}
                          {...register("discountType")}
                          className="w-28"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0"
                          {...register("discountValue", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      {discountAmount > 0 && (
                        <p className="text-xs text-success font-mono">
                          - {formatCurrency(discountAmount)} discount
                        </p>
                      )}
                    </div>

                    {/* Final Amount */}
                    <div className="pt-3 border-t-2 border-gold-200">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-heading font-bold text-charcoal-700">
                          Final Amount
                        </span>
                        <PriceDisplay amount={finalAmount} size="lg" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin">â³</span>
                          Generatingâ€¦
                        </>
                      ) : (
                        <>
                          <FileText size={16} />
                          Generate Bill
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-sm text-charcoal-400">
                    Add products to see price summary
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
