import { ChevronRight, Clock, CalendarX } from "lucide-react";
import type { Esquema } from "@/shared/models/esquema";
import { CardButton } from "@/shared/ui/Card";
import { SkeletonList } from "@/shared/ui/Skeleton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { AppFooter } from "@/shared/ui/AppFooter";
import { SentidoBadge } from "./SentidoBadge";

type Props = {
  esquemas: Esquema[];
  isLoading: boolean;
  onSelect: (esquema: Esquema) => void;
  lastUpdated: string | null;
};

export function EsquemaPicker({ esquemas, isLoading, onSelect, lastUpdated }: Props) {
  if (isLoading) return <SkeletonList rows={4} />;

  if (esquemas.length === 0) {
    return (
      <EmptyState icon={CalendarX} title="Nenhum horário disponível para esta linha" />
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {esquemas.map((esquema) => (
          <li key={esquema.id}>
            <CardButton onClick={() => onSelect(esquema)}>
              <span className="flex items-center gap-2 font-semibold tabular-nums">
                <Clock className="size-4.5 text-text-subtle" />
                {esquema.horario}
              </span>
              <span className="flex-1" />
              <SentidoBadge sentido={esquema.sentido} />
              <ChevronRight className="size-4.5 shrink-0 text-text-subtle transition-transform group-hover:translate-x-0.5" />
            </CardButton>
          </li>
        ))}
      </ul>

      <AppFooter lastUpdated={lastUpdated} />
    </>
  );
}
