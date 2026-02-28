"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  Receipt,
  ArrowLeft,
  Edit,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { formatCurrency, formatDate } from "@/lib/utils";
import { fadeIn } from "@/lib/animations";

interface PaymentHistoryItem {
  _id: string;
  bill?: string;
  billNumber?: string;
  billAmount: number;
  amountPaid: number;
  debtAdded: number;
  debtBefore: number;
  debtAfter: number;
  note: string;
  date: string;
}

interface BillItem {
  _id: string;
  billNumber: string;
  finalAmount: number;
  amountPaid: number;
  paymentMode: string;
  createdAt: string;
  productSnapshot?: {
    name?: string;
    productCode?: string;
  };
}

interface CustomerDetail {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalDebt: number;
  totalPurchases: number;
  totalPaid: number;
  billCount: number;
  paymentHistory: PaymentHistoryItem[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bills: BillItem[];
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pay debt modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  // Adjust debt modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchCustomer = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      if (data.success) {
        setCustomer(data.data);
      } else {
        toast.error("Customer not found");
        router.push("/admin/customers");
      }
    } catch {
      toast.error("Failed to load customer");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handlePayDebt = async () => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsPaying(true);
    try {
      const res = await fetch(`/api/customers/${id}/pay-debt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, note: payNote }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowPayModal(false);
        setPayAmount("");
        setPayNote("");
        fetchCustomer();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to record payment");
    } finally {
      setIsPaying(false);
    }
  };

  const handleAdjustDebt = async () => {
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsAdjusting(true);
    try {
      const res = await fetch(`/api/customers/${id}/adjust-debt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, note: adjustNote }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowAdjustModal(false);
        setAdjustAmount("");
        setAdjustNote("");
        fetchCustomer();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to adjust debt");
    } finally {
      setIsAdjusting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const paymentHistory = [...(customer.paymentHistory || [])].reverse();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Customers", href: "/admin/customers" },
          { label: customer.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/customers")}
            className="w-10 h-10 rounded-xl border border-charcoal-200 flex items-center justify-center hover:bg-charcoal-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-charcoal-700 flex items-center gap-2">
              {customer.name}
              {customer.totalDebt > 0 && (
                <Badge variant="rose" size="sm">
                  <AlertTriangle size={10} className="mr-0.5" />
                  Has Debt
                </Badge>
              )}
            </h1>
            <p className="text-sm text-charcoal-400 flex items-center gap-1">
              <Phone size={12} />
              {customer.phone}
              {customer.email && (
                <>
                  <span className="mx-1">•</span>
                  <Mail size={12} />
                  {customer.email}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a
            href={`/api/customers/${customer._id}/debt-pdf`}
            download
            className="inline-flex"
          >
            <Button variant="outline" size="sm">
              <Download size={14} />
              Debt PDF
            </Button>
          </a>
          <Link href={`/admin/customers/${customer._id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit size={14} />
              Edit
            </Button>
          </Link>
          <Link href="/admin/bills/new">
            <Button variant="primary" size="sm">
              <Receipt size={14} />
              New Bill
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <Card>
              <div className="p-4 text-center">
                <p className="text-xs text-charcoal-400 mb-1">Total Purchases</p>
                <p className="text-lg font-bold text-charcoal-700">
                  {formatCurrency(customer.totalPurchases)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <p className="text-xs text-charcoal-400 mb-1">Total Paid</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(customer.totalPaid)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <p className="text-xs text-charcoal-400 mb-1">Outstanding Debt</p>
                <p
                  className={`text-lg font-bold ${
                    customer.totalDebt > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {customer.totalDebt > 0
                    ? formatCurrency(customer.totalDebt)
                    : "Clear"}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <p className="text-xs text-charcoal-400 mb-1">Bills</p>
                <p className="text-lg font-bold text-charcoal-700">
                  {customer.billCount}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Payment History */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={18} className="text-gold-500" />
                  Payment & Debt History
                </CardTitle>
              </CardHeader>
              <div className="px-4 pb-4 md:px-6 md:pb-6">
                {paymentHistory.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {paymentHistory.map((entry) => (
                      <div
                        key={entry._id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-charcoal-100 bg-charcoal-50/30"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            entry.debtAfter < entry.debtBefore
                              ? "bg-green-50 text-green-600"
                              : entry.debtAfter > entry.debtBefore
                              ? "bg-red-50 text-red-600"
                              : "bg-charcoal-100 text-charcoal-500"
                          }`}
                        >
                          {entry.debtAfter < entry.debtBefore ? (
                            <ArrowDownCircle size={16} />
                          ) : entry.debtAfter > entry.debtBefore ? (
                            <ArrowUpCircle size={16} />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-charcoal-700">
                                {entry.note}
                              </p>
                              {entry.billNumber && (
                                <p className="text-xs font-mono text-charcoal-400 mt-0.5">
                                  Bill: {entry.billNumber}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              {entry.amountPaid > 0 && (
                                <p className="text-xs text-green-600 font-mono">
                                  Paid: {formatCurrency(entry.amountPaid)}
                                </p>
                              )}
                              {entry.billAmount > 0 && (
                                <p className="text-xs text-charcoal-500 font-mono">
                                  Bill: {formatCurrency(entry.billAmount)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-charcoal-400">
                              {formatDate(entry.date)}
                            </span>
                            <span className="text-xs font-mono text-charcoal-400">
                              Debt: {formatCurrency(entry.debtBefore)} →{" "}
                              <span
                                className={
                                  entry.debtAfter > entry.debtBefore
                                    ? "text-red-600"
                                    : entry.debtAfter < entry.debtBefore
                                    ? "text-green-600"
                                    : ""
                                }
                              >
                                {formatCurrency(entry.debtAfter)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-charcoal-400 text-center py-8">
                    No payment history yet
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Linked Bills */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt size={18} className="text-gold-500" />
                  Bills ({customer.bills?.length || 0})
                </CardTitle>
              </CardHeader>
              <div className="px-4 pb-4 md:px-6 md:pb-6">
                {customer.bills && customer.bills.length > 0 ? (
                  <div className="space-y-2">
                    {customer.bills.map((bill) => (
                      <div
                        key={bill._id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-charcoal-100 hover:bg-charcoal-50/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-gold-50 flex items-center justify-center shrink-0">
                          <Receipt size={14} className="text-gold-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono font-semibold text-charcoal-700">
                            {bill.billNumber}
                          </p>
                          {bill.productSnapshot?.name && (
                            <p className="text-xs text-charcoal-400 truncate">
                              {bill.productSnapshot.name}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <PriceDisplay amount={bill.finalAmount} size="sm" />
                          {bill.amountPaid < bill.finalAmount && (
                            <p className="text-xs text-red-500 font-mono">
                              Paid: {formatCurrency(bill.amountPaid)}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-charcoal-400 shrink-0">
                          {formatDate(bill.createdAt)}
                        </div>
                        <a
                          href={`/api/bills/${bill._id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon" title="Download PDF">
                            <Download size={14} />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-charcoal-400 text-center py-8">
                    No bills linked to this customer
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right column — Debt actions */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Debt Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet size={18} className="text-gold-500" />
                  Debt Management
                </CardTitle>
              </CardHeader>
              <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4">
                <div className="text-center py-4">
                  <p className="text-xs text-charcoal-400 mb-1">
                    Outstanding Debt
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      customer.totalDebt > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {customer.totalDebt > 0 ? (
                      <span className="flex items-center justify-center gap-1">
                        <IndianRupee size={24} />
                        {customer.totalDebt.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <CheckCircle2 size={24} />
                        No Debt
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowPayModal(true)}
                    disabled={customer.totalDebt <= 0}
                  >
                    <IndianRupee size={14} />
                    Record Payment
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setAdjustAmount(String(customer.totalDebt));
                      setShowAdjustModal(true);
                    }}
                  >
                    <Edit size={14} />
                    Adjust Debt Manually
                  </Button>
                </div>
              </div>
            </Card>

            {/* Customer Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={18} className="text-gold-500" />
                  Customer Info
                </CardTitle>
              </CardHeader>
              <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-charcoal-400" />
                  <span className="text-charcoal-700">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-charcoal-400" />
                    <span className="text-charcoal-700">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-charcoal-400" />
                    <span className="text-charcoal-700">{customer.address}</span>
                  </div>
                )}
                {customer.notes && (
                  <div className="pt-2 border-t border-charcoal-100">
                    <p className="text-xs text-charcoal-400 mb-1">Notes</p>
                    <p className="text-sm text-charcoal-600">{customer.notes}</p>
                  </div>
                )}
                <div className="pt-2 border-t border-charcoal-100">
                  <p className="text-xs text-charcoal-400">
                    Customer since {formatDate(customer.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Pay Debt Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => {
          setShowPayModal(false);
          setPayAmount("");
          setPayNote("");
        }}
        title="Record Debt Payment"
      >
        <div className="space-y-4">
          <p className="text-sm text-charcoal-500">
            Current debt:{" "}
            <span className="font-bold text-red-600">
              {formatCurrency(customer.totalDebt)}
            </span>
          </p>
          <Input
            label="Payment Amount *"
            type="number"
            step="0.01"
            min="0.01"
            max={customer.totalDebt}
            placeholder="Enter amount"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
          />
          {payAmount && parseFloat(payAmount) > 0 && (
            <p className="text-sm text-charcoal-500">
              Remaining debt after payment:{" "}
              <span className="font-bold text-charcoal-700">
                {formatCurrency(
                  Math.max(0, customer.totalDebt - parseFloat(payAmount))
                )}
              </span>
            </p>
          )}
          <Input
            label="Note (optional)"
            placeholder="e.g. Cash payment at shop"
            value={payNote}
            onChange={(e) => setPayNote(e.target.value)}
          />
          <div className="flex gap-2 pt-2">
            <Button
              variant="primary"
              onClick={handlePayDebt}
              disabled={isPaying}
              className="flex-1"
            >
              {isPaying ? "Processing..." : "Record Payment"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPayAmount(String(customer.totalDebt));
              }}
            >
              Pay Full
            </Button>
          </div>
        </div>
      </Modal>

      {/* Adjust Debt Modal */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => {
          setShowAdjustModal(false);
          setAdjustAmount("");
          setAdjustNote("");
        }}
        title="Adjust Debt Amount"
      >
        <div className="space-y-4">
          <p className="text-sm text-charcoal-500">
            Current debt:{" "}
            <span className="font-bold text-red-600">
              {formatCurrency(customer.totalDebt)}
            </span>
          </p>
          <Input
            label="New Debt Amount *"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter new debt amount"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.target.value)}
          />
          <Input
            label="Reason (optional)"
            placeholder="e.g. Debt correction, waiver, etc."
            value={adjustNote}
            onChange={(e) => setAdjustNote(e.target.value)}
          />
          <div className="flex gap-2 pt-2">
            <Button
              variant="primary"
              onClick={handleAdjustDebt}
              disabled={isAdjusting}
              className="flex-1"
            >
              {isAdjusting ? "Updating..." : "Update Debt"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setAdjustAmount("0")}
            >
              Clear Debt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
