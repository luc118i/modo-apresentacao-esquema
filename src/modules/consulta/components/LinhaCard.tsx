import { Building2, ChevronRight, FileText, MapPin } from "lucide-react";
import type { Linha } from "@/shared/models/linha";
import { Badge } from "@/shared/ui/Badge";
import { fotoCidade, gradienteUf } from "../lib/cidadeImagem";
import { parseLinhaTitulo, type CidadeUf } from "../lib/linhaTitulo";

type Props = {
  linha: Linha;
  onSelect: (key: string) => void;
};

function Metade({ cidadeUf }: { cidadeUf: CidadeUf }) {
  const foto = fotoCidade(cidadeUf.cidade, cidadeUf.uf);
  const { from, to } = gradienteUf(cidadeUf.uf);

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      {foto ? (
        <img
          src={foto}
          alt={cidadeUf.cidade}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0 grid place-items-center"
          style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
        >
          <Building2 className="size-7 text-white/25" strokeWidth={1.5} />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2.5 pt-8">
        <span className="flex items-center gap-1.5 truncate text-base font-bold text-white">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{cidadeUf.cidade}</span>
        </span>
        {cidadeUf.uf && <span className="text-xs text-white/70">{cidadeUf.uf}</span>}
      </div>
    </div>
  );
}

/** Card de linha com a cidade de origem/destino em foto (ou gradiente) lado a lado. */
export function LinhaCard({ linha, onSelect }: Props) {
  const { origem, destino } = parseLinhaTitulo(linha.nomeLinha, linha.codLinha);

  return (
    <button
      onClick={() => onSelect(linha.key)}
      className="group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface text-left shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="relative flex h-28 w-full">
        <Metade cidadeUf={origem} />
        <Metade cidadeUf={destino} />

        {/* Trilho central — mesma metáfora do "nó" da timeline do roteiro. */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/40" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-white/80" />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-medium">{linha.nomeLinha}</span>
          {linha.codLinha && (
            <span className="truncate font-mono text-xs text-text-subtle">{linha.codLinha}</span>
          )}
        </span>
        <Badge className="gap-1.5">
          <FileText className="size-3" />
          {linha.totalEsquemas} {linha.totalEsquemas === 1 ? "esquema" : "esquemas"}
        </Badge>
        <ChevronRight className="size-4.5 shrink-0 text-text-subtle transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
