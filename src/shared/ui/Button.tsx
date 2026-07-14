import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "ghost" | "outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  ghost: "text-text-muted hover:bg-surface-hover hover:text-text",
  outline: "border border-border text-text hover:bg-surface-hover",
};

export function Button({ variant = "primary", className, ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
