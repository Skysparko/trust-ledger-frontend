import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-zinc-200/50 bg-white/80 backdrop-blur-sm px-4 py-3 text-base ring-offset-white placeholder:text-zinc-400 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:border-blue-400 focus-visible:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700/50 dark:bg-zinc-900/80 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-500 dark:focus-visible:ring-blue-400/50 dark:focus-visible:border-blue-500 dark:focus-visible:bg-zinc-900/90",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";


