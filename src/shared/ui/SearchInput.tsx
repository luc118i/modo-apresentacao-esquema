import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function SearchInput({ className, ...props }: Props) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-text-subtle"
        aria-hidden
      />
      <input
        type="search"
        className={cn(
          "w-full rounded-lg border border-border bg-surface py-3 pl-11 pr-4 text-base text-text",
          "placeholder:text-text-subtle shadow-sm transition",
          "focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10",
          className,
        )}
        {...props}
      />
    </div>
  );
}
