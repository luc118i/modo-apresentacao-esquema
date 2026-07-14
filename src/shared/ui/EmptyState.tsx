import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && <Icon className="size-7 text-text-subtle" aria-hidden />}
      <p className="font-medium text-text">{title}</p>
      {description && <p className="max-w-sm text-sm text-text-muted">{description}</p>}
    </div>
  );
}
