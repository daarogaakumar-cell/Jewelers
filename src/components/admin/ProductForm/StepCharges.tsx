"use client";

import { Plus, Trash2, CircleDollarSign, Gem } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { formatCurrency } from "@/lib/utils";
import { CHARGE_TYPES, DEFAULT_GST_PERCENTAGE } from "@/constants";
import type { CompositionData, MetalEntry, GemstoneEntry } from "./StepComposition";

export interface ChargesData {
  makingCharges: { type: "fixed" | "percentage"; value: number };
  gstPercentage: number;
  otherCharges: Array<{ name: string; amount: number }>;
}

interface StepChargesProps {
  data: ChargesData;
  onChange: (data: ChargesData) => void;
  /** Full composition data so we can render per-material wastage inputs */
  compositionData: CompositionData;
  onCompositionChange: (data: CompositionData) => void;
  onNext: () => void;
  onBack: () => void;
}

function resolveCharge(
  charges: { type: "fixed" | "percentage"; value: number } | undefined,
  base: number
): number {
  if (!charges || !charges.value) return 0;
  if (charges.type === "percentage") return base * (charges.value / 100);
  return charges.value;
}

export function StepCharges({
  data,
  onChange,
  compositionData,
  onCompositionChange,
  onNext,
  onBack,
}: StepChargesProps) {
  const metalTotal = compositionData.metals.reduce(
    (s, m) => s + m.weightInGrams * m.pricePerGram,
    0
  );

  const makingAmount = resolveCharge(data.makingCharges, metalTotal);

  // Per-material wastage totals
  const metalWastageTotal = compositionData.metals.reduce((s, m) => {
    const subtotal = m.weightInGrams * m.pricePerGram;
    return s + resolveCharge(m.wastageCharges, subtotal);
  }, 0);
  const gemstoneWastageTotal = compositionData.gemstones.reduce((s, g) => {
    const subtotal = g.weightInCarats * g.quantity * g.pricePerCarat;
    return s + resolveCharge(g.wastageCharges, subtotal);
  }, 0);
  const totalWastage = metalWastageTotal + gemstoneWastageTotal;

  const otherTotal = data.otherCharges.reduce((s, c) => s + c.amount, 0);

  // Handlers for per-metal wastage
  const updateMetalWastage = (
    index: number,
    field: "type" | "value",
    val: string | number
  ) => {
    const updatedMetals = compositionData.metals.map((m, i) => {
      if (i !== index) return m;
      return {
        ...m,
        wastageCharges: {
          ...m.wastageCharges,
          [field]: val,
        },
      } as MetalEntry;
    });
    onCompositionChange({ ...compositionData, metals: updatedMetals });
  };

  // Handlers for per-gemstone wastage
  const updateGemstoneWastage = (
    index: number,
    field: "type" | "value",
    val: string | number
  ) => {
    const updatedGemstones = compositionData.gemstones.map((g, i) => {
      if (i !== index) return g;
      return {
        ...g,
        wastageCharges: {
          ...g.wastageCharges,
          [field]: val,
        },
      } as GemstoneEntry;
    });
    onCompositionChange({ ...compositionData, gemstones: updatedGemstones });
  };

  const addOtherCharge = () => {
    onChange({
      ...data,
      otherCharges: [...data.otherCharges, { name: "", amount: 0 }],
    });
  };

  const updateOtherCharge = (
    index: number,
    updates: Partial<{ name: string; amount: number }>
  ) => {
    const updated = [...data.otherCharges];
    updated[index] = { ...updated[index], ...updates };
    onChange({ ...data, otherCharges: updated });
  };

  const removeOtherCharge = (index: number) => {
    onChange({
      ...data,
      otherCharges: data.otherCharges.filter((_, i) => i !== index),
    });
  };

  const noComposition =
    compositionData.metals.length === 0 &&
    compositionData.gemstones.length === 0;

  return (
    <div className="space-y-6">
      {/* Making Charges */}
      <Card>
        <div className="p-5 md:p-6 space-y-5">
          <h2 className="text-lg font-semibold text-charcoal-700">
            Making Charges
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Charge Type"
              value={data.makingCharges.type}
              onChange={(e) =>
                onChange({
                  ...data,
                  makingCharges: {
                    ...data.makingCharges,
                    type: e.target.value as "fixed" | "percentage",
                  },
                })
              }
              options={[...CHARGE_TYPES]}
            />
            <Input
              label={
                data.makingCharges.type === "percentage"
                  ? "Percentage (%)"
                  : "Amount (₹)"
              }
              type="number"
              step="0.01"
              min="0"
              value={data.makingCharges.value || ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  makingCharges: {
                    ...data.makingCharges,
                    value: parseFloat(e.target.value) || 0,
                  },
                })
              }
            />
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
                Resolved Amount
              </label>
              <div className="flex items-center h-11 px-3 rounded-lg bg-charcoal-100/50 border border-charcoal-100">
                <span className="text-sm font-mono text-gold-700">
                  {formatCurrency(makingAmount)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-charcoal-400">
            Making charges are calculated against the total metal value.
          </p>
        </div>
      </Card>

      {/* Per-Material Wastage Charges */}
      <Card>
        <div className="p-5 md:p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-charcoal-700">
                Wastage Charges
              </h2>
              <p className="text-xs text-charcoal-400 mt-0.5">
                Set wastage independently for each metal and gemstone.
              </p>
            </div>
            {totalWastage > 0 && (
              <div className="text-right">
                <p className="text-xs text-charcoal-400 mb-0.5">Total Wastage</p>
                <span className="text-sm font-semibold font-mono text-gold-700">
                  ₹ {formatCurrency(totalWastage)}
                </span>
              </div>
            )}
          </div>

          {noComposition ? (
            <p className="text-sm text-charcoal-400 text-center py-4">
              No materials added. Go back to Step&nbsp;2 to add metals or
              gemstones first.
            </p>
          ) : (
            <>
              {/* Metal wastage rows */}
              {compositionData.metals.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-charcoal-600">
                    <CircleDollarSign size={15} className="text-gold-500" />
                    Metals
                  </div>
                  {compositionData.metals.map((m, index) => {
                    const subtotal = m.weightInGrams * m.pricePerGram;
                    const wastageAmt = resolveCharge(m.wastageCharges, subtotal);
                    const label =
                      m.metalName && m.variantName
                        ? `${m.metalName} — ${m.variantName}`
                        : `Metal ${index + 1}`;
                    return (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-4 rounded-xl border border-charcoal-100 bg-charcoal-50/30 p-4"
                      >
                        {/* Label */}
                        <div className="sm:col-span-1 flex flex-col justify-center">
                          <p className="text-sm font-medium text-charcoal-700 truncate">
                            {label}
                          </p>
                          <p className="text-xs text-charcoal-400">
                            Subtotal: ₹ {formatCurrency(subtotal)}
                          </p>
                        </div>
                        {/* Type */}
                        <Select
                          label="Wastage Type"
                          value={m.wastageCharges?.type ?? "percentage"}
                          onChange={(e) =>
                            updateMetalWastage(index, "type", e.target.value)
                          }
                          options={[...CHARGE_TYPES]}
                        />
                        {/* Value */}
                        <Input
                          label={
                            (m.wastageCharges?.type ?? "percentage") ===
                            "percentage"
                              ? "Wastage (%)"
                              : "Wastage (₹)"
                          }
                          type="number"
                          step="0.01"
                          min="0"
                          value={m.wastageCharges?.value || ""}
                          onChange={(e) =>
                            updateMetalWastage(
                              index,
                              "value",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                        {/* Resolved */}
                        <div>
                          <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
                            Resolved
                          </label>
                          <div className="flex items-center h-11 px-3 rounded-lg bg-charcoal-100/50 border border-charcoal-100">
                            <span className="text-sm font-mono text-gold-700">
                              {formatCurrency(wastageAmt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Gemstone wastage rows */}
              {compositionData.gemstones.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-charcoal-600">
                    <Gem size={15} className="text-gold-500" />
                    Gemstones
                  </div>
                  {compositionData.gemstones.map((g, index) => {
                    const subtotal =
                      g.weightInCarats * g.quantity * g.pricePerCarat;
                    const wastageAmt = resolveCharge(g.wastageCharges, subtotal);
                    const label =
                      g.gemstoneName && g.variantName
                        ? `${g.gemstoneName} — ${g.variantName}`
                        : `Gemstone ${index + 1}`;
                    return (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-4 rounded-xl border border-charcoal-100 bg-charcoal-50/30 p-4"
                      >
                        {/* Label */}
                        <div className="sm:col-span-1 flex flex-col justify-center">
                          <p className="text-sm font-medium text-charcoal-700 truncate">
                            {label}
                          </p>
                          <p className="text-xs text-charcoal-400">
                            Subtotal: ₹ {formatCurrency(subtotal)}
                          </p>
                        </div>
                        {/* Type */}
                        <Select
                          label="Wastage Type"
                          value={g.wastageCharges?.type ?? "percentage"}
                          onChange={(e) =>
                            updateGemstoneWastage(index, "type", e.target.value)
                          }
                          options={[...CHARGE_TYPES]}
                        />
                        {/* Value */}
                        <Input
                          label={
                            (g.wastageCharges?.type ?? "percentage") ===
                            "percentage"
                              ? "Wastage (%)"
                              : "Wastage (₹)"
                          }
                          type="number"
                          step="0.01"
                          min="0"
                          value={g.wastageCharges?.value || ""}
                          onChange={(e) =>
                            updateGemstoneWastage(
                              index,
                              "value",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                        {/* Resolved */}
                        <div>
                          <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
                            Resolved
                          </label>
                          <div className="flex items-center h-11 px-3 rounded-lg bg-charcoal-100/50 border border-charcoal-100">
                            <span className="text-sm font-mono text-gold-700">
                              {formatCurrency(wastageAmt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* GST */}
      <Card>
        <div className="p-5 md:p-6">
          <h2 className="text-lg font-semibold text-charcoal-700 mb-4">GST</h2>
          <div className="max-w-xs">
            <Input
              label="GST Percentage (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={data.gstPercentage}
              onChange={(e) =>
                onChange({
                  ...data,
                  gstPercentage:
                    parseFloat(e.target.value) || DEFAULT_GST_PERCENTAGE,
                })
              }
              helperText={`Default: ${DEFAULT_GST_PERCENTAGE}%`}
            />
          </div>
        </div>
      </Card>

      {/* Other Charges */}
      <Card>
        <CardHeader>
          <CardTitle>Other Charges</CardTitle>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addOtherCharge}
          >
            <Plus size={16} />
            Add Charge
          </Button>
        </CardHeader>
        <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-3">
          {data.otherCharges.length === 0 ? (
            <p className="text-sm text-charcoal-400 text-center py-4">
              No additional charges. Click &quot;Add Charge&quot; for
              certification fees, hallmark charges, etc.
            </p>
          ) : (
            data.otherCharges.map((charge, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                    label="Charge Name"
                    placeholder="e.g., Certification Fee"
                    value={charge.name}
                    onChange={(e) =>
                      updateOtherCharge(index, { name: e.target.value })
                    }
                  />
                </div>
                <div className="w-36">
                  <Input
                    label="Amount (₹)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={charge.amount || ""}
                    onChange={(e) =>
                      updateOtherCharge(index, {
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOtherCharge(index)}
                  className="text-charcoal-400 hover:text-error h-11 w-11 min-w-0 mb-0"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))
          )}

          {otherTotal > 0 && (
            <div className="flex items-center justify-end pt-2 border-t border-charcoal-100">
              <span className="text-sm text-charcoal-500 mr-3">
                Other Charges Total:
              </span>
              <PriceDisplay amount={otherTotal} />
            </div>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="button" variant="primary" onClick={onNext}>
          Continue to Images
        </Button>
      </div>
    </div>
  );
}
