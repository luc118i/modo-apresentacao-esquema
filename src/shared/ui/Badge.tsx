import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Tone = "neutral" | "primary" | "ida" | "volta";

type Props = HTMLAttributes<HTMLSpanElement> & { tone?: Tone };

const tones: Record<Tone, string> = {
  neutral: "bg-surface-hover text-text-muted",
  primary: "bg-primary-soft text-primary",
  ida: "bg-[color-mix(in_srgb,var(--color-ida)_14%,transparent)] text-ida",
  volta: "bg-[color-mix(in_srgb,var(--color-volta)_14%,transparent)] text-volta",
};

export function Badge({ tone = "neutral", className, ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
