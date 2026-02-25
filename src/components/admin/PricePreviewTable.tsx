"use client";

import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface AffectedProduct {
  _id: string;
  name: string;
  productCode: string;
  oldTotalPrice: number;
  newTotalPrice: number;
  priceDifference: number;
}

interface PricePreviewTableProps {
  products: AffectedProduct[];
}

export function PricePreviewTable({ products }: PricePreviewTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-charcoal-400">
        No products will be affected by this price change.
      </div>
    );
  }

  const totalOld = products.reduce((s, p) => s + p.oldTotalPrice, 0);
  const totalNew = products.reduce((s, p) => s + p.newTotalPrice, 0);
  const totalDiff = totalNew - totalOld;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-charcoal-50 text-sm">
        <span className="text-charcoal-500">Total Impact</span>
        <span
          className={cn(
            "font-mono font-medium",
            totalDiff > 0
              ? "text-success"
              : totalDiff < 0
                ? "text-error"
                : "text-charcoal-500"
          )}
        >
          {totalDiff > 0 ? "+" : ""}
          {formatCurrency(totalDiff)}
        </span>
      </div>

      {/* Product list */}
      <div className="max-h-75 overflow-y-auto space-y-1 pr-1">
        {products.map((product) => {
          const isUp = product.priceDifference > 0;
          const isDown = product.priceDifference < 0;

          return (
            <div
              key={product._id}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-charcoal-50 transition-colors border-b border-charcoal-50 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-charcoal-700 truncate">
                  {product.name}
                </p>
                <p className="text-xs font-mono text-charcoal-400">
                  {product.productCode}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                {/* Old price */}
                <span className="text-sm font-mono text-charcoal-400 line-through">
                  {formatCurrency(product.oldTotalPrice)}
                </span>

                <span className="text-charcoal-300">→</span>

                {/* New price */}
                <span className="text-sm font-mono font-medium text-charcoal-700">
                  {formatCurrency(product.newTotalPrice)}
                </span>

                {/* Difference badge */}
                <Badge
                  variant={isUp ? "success" : isDown ? "error" : "default"}
                  size="sm"
                >
                  {isUp ? (
                    <TrendingUp size={10} />
                  ) : isDown ? (
                    <TrendingDown size={10} />
                  ) : (
                    <Minus size={10} />
                  )}
                  {isUp ? "+" : ""}
                  {formatCurrency(product.priceDifference)}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
