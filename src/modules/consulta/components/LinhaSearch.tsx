import { ChevronRight, MapPin, SearchX } from "lucide-react";
import type { Linha } from "@/shared/models/linha";
import { CardButton } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { SearchInput } from "@/shared/ui/SearchInput";
import { SkeletonList } from "@/shared/ui/Skeleton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { AppFooter } from "@/shared/ui/AppFooter";

type Props = {
  query: string;
  onQuery: (v: string) => void;
  linhas: Linha[];
  isLoading: boolean;
  isError: boolean;
  onSelect: (key: string) => void;
  lastUpdated: string | null;
};

export function LinhaSearch({
  query,
  onQuery,
  linhas,
  isLoading,
  isError,
  onSelect,
  lastUpdated,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-14 z-10 -mx-4 border-b border-border bg-bg/95 px-4 pb-4 pt-4 shadow-[0_8px_10px_-6px_rgba(0,0,0,0.15)] backdrop-blur">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Consultar esquema</h1>
          <p className="mt-1 text-sm text-text-muted">
            Busque pela linha e veja o roteiro de pontos.
          </p>
        </div>

        <div className="mt-4">
          <SearchInput
            placeholder="Buscar linha — ex.: Fortaleza, Recife…"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonList />
      ) : isError ? (
        <EmptyState
          icon={SearchX}
          title="Não foi possível carregar as linhas"
          description="Tente novamente em instantes."
        />
      ) : linhas.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhuma linha encontrada"
          description="Ajuste os termos da busca."
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {linhas.map((linha) => (
            <li key={linha.key}>
              <CardButton onClick={() => onSelect(linha.key)}>
                <MapPin className="size-4.5 shrink-0 text-text-subtle" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-medium">{linha.nomeLinha}</span>
                  {linha.codLinha && (
                    <span className="truncate font-mono text-xs text-text-subtle">
                      {linha.codLinha}
                    </span>
                  )}
                </span>
                <Badge>
                  {linha.totalEsquemas} {linha.totalEsquemas === 1 ? "esquema" : "esquemas"}
                </Badge>
                <ChevronRight className="size-4.5 shrink-0 text-text-subtle transition-transform group-hover:translate-x-0.5" />
              </CardButton>
            </li>
          ))}
        </ul>
      )}

      <AppFooter lastUpdated={lastUpdated} />
    </div>
  );
}
