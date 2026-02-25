"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, RefreshCw, X, Package } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { PricePreviewTable } from "@/components/admin/PricePreviewTable";
import { formatCurrency } from "@/lib/utils";

interface PriceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSynced: () => void;
  entityType: "metal" | "gemstone";
  entityId: string;
  entityName: string;
  variantId: string;
  variantName: string;
  oldPrice: number;
  newPrice: number;
  unit: string;
}

interface PreviewData {
  affectedCount: number;
  products: Array<{
    _id: string;
    name: string;
    productCode: string;
    oldTotalPrice: number;
    newTotalPrice: number;
    priceDifference: number;
  }>;
}

export function PriceSyncModal({
  isOpen,
  onClose,
  onSynced,
  entityType,
  entityId,
  entityName,
  variantId,
  variantName,
  oldPrice,
  newPrice,
  unit,
}: PriceSyncModalProps) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ count: number } | null>(null);

  // Fetch preview when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setPreview(null);
      setSyncResult(null);
      return;
    }

    async function fetchPreview() {
      setIsLoadingPreview(true);
      try {
        const params = new URLSearchParams({
          entityType,
          entityId,
          variantId,
          newPrice: String(newPrice),
        });
        const res = await fetch(`/api/pricing/preview?${params}`);
        const data = await res.json();
        if (data.success) {
          setPreview(data.data);
        } else {
          toast.error(data.error || "Failed to load preview");
        }
      } catch {
        toast.error("Failed to load pricing preview");
      } finally {
        setIsLoadingPreview(false);
      }
    }

    fetchPreview();
  }, [isOpen, entityType, entityId, variantId, newPrice]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/pricing/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, variantId, newPrice }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult({ count: data.data.syncedProducts });
        toast.success(data.message);
        // Delay to show success animation, then close
        setTimeout(() => {
          onSynced();
          onClose();
        }, 1500);
      } else {
        toast.error(data.error || "Failed to sync prices");
      }
    } catch {
      toast.error("Failed to sync prices");
    } finally {
      setIsSyncing(false);
    }
  };

  const priceChange = newPrice - oldPrice;
  const isIncrease = priceChange > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-heading font-bold text-charcoal-700">
              Price Update & Sync
            </h2>
            <p className="text-sm text-charcoal-400 mt-1">
              Review the impact before confirming
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:bg-charcoal-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {syncResult ? (
            /* Success state */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="text-success" size={32} />
              </motion.div>
              <h3 className="text-lg font-semibold text-charcoal-700">
                Sync Complete!
              </h3>
              <p className="text-sm text-charcoal-400 mt-1">
                {syncResult.count} product{syncResult.count !== 1 ? "s" : ""}{" "}
                updated successfully
              </p>
            </motion.div>
          ) : (
            <motion.div key="preview" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Price change summary */}
              <div className="rounded-xl border border-charcoal-100 p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant={entityType === "metal" ? "gold" : "rose"}>
                    {entityType === "metal" ? "Metal" : "Gemstone"}
                  </Badge>
                  <span className="text-sm font-medium text-charcoal-700">
                    {entityName} — {variantName}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-charcoal-400 mb-1">Current</p>
                    <PriceDisplay amount={oldPrice} suffix={`/${unit}`} />
                  </div>
                  <span className="text-xl text-charcoal-300">→</span>
                  <div className="text-center">
                    <p className="text-xs text-charcoal-400 mb-1">New</p>
                    <PriceDisplay amount={newPrice} suffix={`/${unit}`} />
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-charcoal-400 mb-1">Change</p>
                    <span
                      className={`text-sm font-mono font-semibold ${
                        isIncrease ? "text-success" : "text-error"
                      }`}
                    >
                      {isIncrease ? "+" : ""}
                      {formatCurrency(priceChange)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Affected products */}
              {isLoadingPreview ? (
                <div className="space-y-3 py-4">
                  <Skeleton className="h-5 w-48" />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : preview ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package size={16} className="text-charcoal-400" />
                    <h3 className="text-sm font-medium text-charcoal-700">
                      Affected Products ({preview.affectedCount})
                    </h3>
                  </div>

                  {preview.affectedCount > 0 ? (
                    <>
                      <div className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 text-warning px-3 py-2 mb-3">
                        <AlertTriangle size={14} className="shrink-0" />
                        <p className="text-xs">
                          This will update prices for{" "}
                          <strong>{preview.affectedCount}</strong> product
                          {preview.affectedCount !== 1 ? "s" : ""}. This action
                          cannot be undone.
                        </p>
                      </div>
                      <PricePreviewTable products={preview.products} />
                    </>
                  ) : (
                    <div className="text-center py-6 text-sm text-charcoal-400 rounded-lg bg-charcoal-50">
                      No products use this variant. The price will be updated
                      for future products.
                    </div>
                  )}
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-charcoal-100">
                <Button variant="outline" onClick={onClose} disabled={isSyncing}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSync}
                  disabled={isLoadingPreview || isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      Update Price & Sync{" "}
                      {preview && preview.affectedCount > 0
                        ? `(${preview.affectedCount})`
                        : ""}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
