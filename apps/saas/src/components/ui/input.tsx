import * as React from "react";
import { cn } from "#/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-lg border border-border-strong bg-panel px-3 py-1 text-sm text-ink-1 shadow-xs transition-all duration-150 placeholder:text-ink-3 hover:border-ink-3 focus-visible:border-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
