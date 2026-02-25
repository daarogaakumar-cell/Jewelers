import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile: Compact stepper */}
      <div className="flex items-center justify-between md:hidden">
        <span className="text-sm font-medium text-charcoal-600">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-sm text-charcoal-400">
          {steps[currentStep - 1]?.label}
        </span>
      </div>

      {/* Desktop: Full stepper */}
      <div className="hidden md:flex items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  step.id < currentStep &&
                    "bg-gold-500 text-white",
                  step.id === currentStep &&
                    "bg-gold-500 text-white ring-4 ring-gold-100",
                  step.id > currentStep &&
                    "bg-charcoal-100 text-charcoal-400"
                )}
              >
                {step.id < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  step.id <= currentStep
                    ? "text-charcoal-600"
                    : "text-charcoal-300"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="mx-3 flex-1 h-px bg-charcoal-200">
                <div
                  className="h-full bg-gold-500 transition-all duration-300"
                  style={{
                    width: step.id < currentStep ? "100%" : "0%",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
