import { cn } from "@/shared/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-hover", className)} />;
}

/** Placeholder de lista, reutilizado nos estados de carregamento. */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-[58px] w-full" />
      ))}
    </div>
  );
}
