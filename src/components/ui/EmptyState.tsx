import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-50">
        <Icon className="h-8 w-8 text-gold-500" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-charcoal-600">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-charcoal-400">{description}</p>
      {action}
    </div>
  );
}
