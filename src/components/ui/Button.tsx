"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gold-500 text-white hover:bg-gold-600 shadow-sm hover:shadow-md",
        secondary:
          "border-2 border-gold-500 text-gold-700 bg-transparent hover:bg-gold-50",
        ghost:
          "text-charcoal-500 hover:bg-charcoal-100 hover:text-charcoal-700",
        danger:
          "bg-error text-white hover:bg-red-700 shadow-sm",
        outline:
          "border border-charcoal-200 text-charcoal-600 bg-white hover:bg-charcoal-50 hover:border-charcoal-300",
      },
      size: {
        sm: "h-9 px-3 text-sm min-w-[44px]",
        md: "h-11 px-5 text-sm min-w-[44px]",
        lg: "h-12 px-8 text-base min-w-[44px]",
        icon: "h-11 w-11 min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
