import { IMetalComposition, IGemstoneComposition, ICharges, IOtherCharge } from "@/types";

interface PriceCalculationInput {
  metalComposition: IMetalComposition[];
  gemstoneComposition: IGemstoneComposition[];
  makingCharges: ICharges;
  /**
   * @deprecated Use per-composition `wastageCharges` instead.
   * Kept for backward-compatibility — used only when no composition has wastageCharges set.
   */
  wastageCharges?: ICharges;
  gstPercentage: number;
  otherCharges: IOtherCharge[];
}

interface PriceCalculationResult {
  metalTotal: number;
  gemstoneTotal: number;
  makingChargeAmount: number;
  wastageChargeAmount: number;
  otherChargesTotal: number;
  subtotal: number;
  gstAmount: number;
  totalPrice: number;
}

/**
 * Calculate all product prices from composition and charges.
 * Wastage is now applied per-component (each metal/gemstone row carries its own
 * wastageCharges applied against that component's subtotal).
 * Falls back to the legacy global `wastageCharges` × metalTotal when no
 * per-component charges are present (backward compat).
 */
export function calculateProductPrice(
  input: PriceCalculationInput
): PriceCalculationResult {
  // 1. Calculate metal total & per-metal wastage
  let metalWastageTotal = 0;
  const metalTotal = input.metalComposition.reduce((sum, comp) => {
    const subtotal = comp.weightInGrams * comp.pricePerGram;
    metalWastageTotal += resolveCharge(comp.wastageCharges, subtotal);
    return sum + subtotal;
  }, 0);

  // 2. Calculate gemstone total & per-gemstone wastage
  let gemstoneWastageTotal = 0;
  const gemstoneTotal = input.gemstoneComposition.reduce((sum, comp) => {
    const subtotal = comp.weightInCarats * comp.quantity * comp.pricePerCarat;
    gemstoneWastageTotal += resolveCharge(comp.wastageCharges, subtotal);
    return sum + subtotal;
  }, 0);

  // 3. Making charges (always based on metal total)
  const makingChargeAmount = resolveCharge(input.makingCharges, metalTotal);

  // 4. Wastage — per-component if present, otherwise fall back to legacy global
  const hasPerComponentWastage =
    input.metalComposition.some((c) => c.wastageCharges && c.wastageCharges.value > 0) ||
    input.gemstoneComposition.some((c) => c.wastageCharges && c.wastageCharges.value > 0);

  const wastageChargeAmount = hasPerComponentWastage
    ? metalWastageTotal + gemstoneWastageTotal
    : resolveCharge(input.wastageCharges, metalTotal);

  // 5. Other charges total
  const otherChargesTotal = input.otherCharges.reduce(
    (sum, charge) => sum + charge.amount,
    0
  );

  // 6. Subtotal (before GST)
  const subtotal =
    metalTotal +
    gemstoneTotal +
    makingChargeAmount +
    wastageChargeAmount +
    otherChargesTotal;

  // 7. GST
  const gstAmount = subtotal * (input.gstPercentage / 100);

  // 8. Total price
  const totalPrice = subtotal + gstAmount;

  return {
    metalTotal: round(metalTotal),
    gemstoneTotal: round(gemstoneTotal),
    makingChargeAmount: round(makingChargeAmount),
    wastageChargeAmount: round(wastageChargeAmount),
    otherChargesTotal: round(otherChargesTotal),
    subtotal: round(subtotal),
    gstAmount: round(gstAmount),
    totalPrice: round(totalPrice),
  };
}

/**
 * Resolve a charge (fixed or percentage) against a base amount.
 * Returns 0 when charges are undefined or value is 0.
 */
function resolveCharge(
  charges: ICharges | undefined | null,
  baseAmount: number
): number {
  if (!charges || charges.value === 0) return 0;
  if (charges.type === "percentage") {
    return baseAmount * (charges.value / 100);
  }
  return charges.value;
}

/**
 * Round to 2 decimal places
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate individual metal composition subtotals
 */
export function calculateMetalSubtotals(
  composition: IMetalComposition[]
): IMetalComposition[] {
  return composition.map((comp) => ({
    ...comp,
    subtotal: round(comp.weightInGrams * comp.pricePerGram),
  }));
}

/**
 * Calculate individual gemstone composition subtotals
 */
export function calculateGemstoneSubtotals(
  composition: IGemstoneComposition[]
): IGemstoneComposition[] {
  return composition.map((comp) => ({
    ...comp,
    subtotal: round(comp.weightInCarats * comp.quantity * comp.pricePerCarat),
  }));
}
