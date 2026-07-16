import { RefreshCw, SearchX } from "lucide-react";
import type { Linha } from "@/shared/models/linha";
import { SearchInput } from "@/shared/ui/SearchInput";
import { SkeletonList } from "@/shared/ui/Skeleton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { AppFooter } from "@/shared/ui/AppFooter";
import { Button } from "@/shared/ui/Button";
import { LinhaCard } from "./LinhaCard";

type Props = {
  query: string;
  onQuery: (v: string) => void;
  linhas: Linha[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelect: (key: string) => void;
  lastUpdated: string | null;
};

export function LinhaSearch({
  query,
  onQuery,
  linhas,
  isLoading,
  isError,
  onRetry,
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
            placeholder="Buscar por cidade, código ou horário — ex.: Apodi, 18:45…"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonList rowClassName="h-[180px] w-full" message="Buscando as linhas certinhas pra você…" />
      ) : isError ? (
        <EmptyState
          icon={SearchX}
          title="Não foi possível carregar as linhas"
          description="Pode ser só a planilha demorando pra responder — tente de novo."
        >
          <Button variant="outline" onClick={onRetry} className="mt-2">
            <RefreshCw className="size-4" />
            Tentar novamente
          </Button>
        </EmptyState>
      ) : linhas.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhuma linha encontrada"
          description="Ajuste os termos da busca."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {linhas.map((linha) => (
            <li key={linha.key}>
              <LinhaCard linha={linha} onSelect={onSelect} />
            </li>
          ))}
        </ul>
      )}

      <AppFooter lastUpdated={lastUpdated} />
    </div>
  );
}
