import { cn } from "@/shared/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-hover", className)} />;
}

type SkeletonListProps = {
  rows?: number;
  /** Altura de cada linha do placeholder — combine com o card real da lista. */
  rowClassName?: string;
  /** Texto amigável exibido acima das linhas (ex.: "Buscando as linhas…"). */
  message?: string;
};

/** Placeholder de lista, reutilizado nos estados de carregamento. */
export function SkeletonList({ rows = 5, rowClassName = "h-[58px] w-full", message }: SkeletonListProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {message && (
        <p className="animate-pulse pb-1 text-center text-sm text-text-muted">{message}</p>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={rowClassName} />
      ))}
    </div>
  );
}
