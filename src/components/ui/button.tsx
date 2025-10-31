"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-black to-zinc-800 text-white shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 dark:from-zinc-100 dark:to-zinc-200 dark:text-black dark:hover:from-zinc-200 dark:hover:to-zinc-300",
        outline:
          "border-2 border-zinc-300 bg-transparent hover:bg-zinc-50 hover:border-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:border-zinc-600",
        ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-900",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-base",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-14 rounded-xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<any>,
        {
          className: cn(
            buttonVariants({ variant, size }),
            (children as any).props?.className,
            className
          ),
          ...props,
        } as any
      );
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };


