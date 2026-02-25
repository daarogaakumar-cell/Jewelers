"use client";

import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  defaultValue?: string;
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  value: controlledValue,
  onChange,
  className,
  defaultValue = "",
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }
      onSearch?.(newValue);
    },
    [onSearch, onChange]
  );

  const handleClear = useCallback(() => {
    if (onChange) {
      onChange("");
    } else {
      setInternalValue("");
    }
    onSearch?.("");
  }, [onSearch, onChange]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-charcoal-200 bg-white pl-10 pr-10 text-base text-charcoal-600 placeholder:text-charcoal-300 transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
