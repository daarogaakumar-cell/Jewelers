import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface PriceDisplayProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  suffix?: string;
  className?: string;
}

const sizeClasses = {
  sm: "text-base",
  md: "text-xl md:text-2xl",
  lg: "text-2xl md:text-3xl",
};

export function PriceDisplay({
  amount,
  size = "md",
  suffix,
  className,
}: PriceDisplayProps) {
  return (
    <span
      className={cn(
        "font-mono font-semibold text-gold-700",
        sizeClasses[size],
        className
      )}
    >
      {formatCurrency(amount)}
      {suffix && (
        <span className="text-charcoal-400 font-normal text-xs ml-0.5">
          {suffix}
        </span>
      )}
    </span>
  );
}
