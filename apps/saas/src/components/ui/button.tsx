import * as React from "react";
import { cn } from "#/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
}

/**
 * Minimal shadcn-style button. Variants are plain Tailwind so no runtime deps
 * beyond clsx + tailwind-merge.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default:
        "bg-ink-1 text-page shadow-xs hover:opacity-85 hover:shadow-sm active:translate-y-px",
      primary:
        "bg-accent-900 text-on-accent shadow-xs hover:bg-accent-800 hover:shadow-sm active:translate-y-px",
      outline:
        "border border-border-strong bg-panel text-ink-1 shadow-xs hover:border-ink-3 hover:bg-panel-2",
      ghost: "text-ink-2 hover:bg-panel-2 hover:text-ink-1",
      destructive: "bg-down text-white shadow-xs hover:bg-red-700",
    };
    const sizes: Record<string, string> = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-11 px-6 text-base",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
