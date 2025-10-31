"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: SelectOption[];
  onValueChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, onValueChange, defaultValue, ...props }, ref) => {
    return (
      <div className={cn("relative inline-block w-full", className)}>
        <select
          ref={ref}
          defaultValue={defaultValue}
          onChange={(e) => onValueChange?.(e.target.value)}
          className={cn(
            "h-12 w-full appearance-none rounded-xl border border-zinc-200/50 bg-white/80 backdrop-blur-sm px-4 pr-10 text-base ring-offset-white placeholder:text-zinc-400 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:border-blue-400 focus-visible:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700/50 dark:bg-zinc-900/80 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-500 dark:focus-visible:ring-blue-400/50 dark:focus-visible:border-blue-500 dark:focus-visible:bg-zinc-900/90"
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-transform duration-200 group-hover:rotate-180" />
      </div>
    );
  }
);
Select.displayName = "Select";


