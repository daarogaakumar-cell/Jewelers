import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  homeHref?: string;
}

export function Breadcrumb({ items, className, homeHref = "/admin/dashboard" }: BreadcrumbProps) {
  // On mobile, only show home + last 1-2 items to prevent overflow
  const mobileItems = items.length > 2
    ? [items[0], { label: "..." }, items[items.length - 1]]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm overflow-x-auto scrollbar-none max-w-full", className)}
    >
      <Link
        href={homeHref}
        className="flex shrink-0 items-center text-charcoal-400 hover:text-gold-600 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {/* Desktop: show all items */}
      <div className="hidden sm:flex items-center">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0 text-charcoal-300" />
            {item.href ? (
              <Link
                href={item.href}
                className="shrink-0 text-charcoal-400 hover:text-gold-600 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-charcoal-600 truncate max-w-50">{item.label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: show condensed items */}
      <div className="flex sm:hidden items-center min-w-0">
        {mobileItems.map((item, index) => (
          <div key={index} className="flex items-center min-w-0">
            <ChevronRight className="mx-1 h-3 w-3 shrink-0 text-charcoal-300" />
            {item.label === "..." ? (
              <span className="text-charcoal-300 text-xs">...</span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="shrink-0 text-xs text-charcoal-400 hover:text-gold-600 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-xs text-charcoal-600 truncate max-w-30">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
