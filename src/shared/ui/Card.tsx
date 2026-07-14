import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-surface shadow-sm", className)}
      {...props}
    />
  );
}

/** Card clicável — usado nas listas de linha/esquema. */
export function CardButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3.5 text-left",
        "shadow-sm transition-colors hover:border-primary/40 hover:bg-surface-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className,
      )}
      {...props}
    />
  );
}
