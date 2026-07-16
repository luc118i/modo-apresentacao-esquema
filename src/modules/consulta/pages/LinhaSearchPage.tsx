import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetHeader } from "@/app/HeaderSlot";
import { normalizeText } from "@/shared/lib/normalize";
import { LinhaSearch } from "../components/LinhaSearch";
import { useLastUpdated, useLinhas } from "../hooks/queries";

export function LinhaSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const linhas = useLinhas();
  const lastUpdated = useLastUpdated();

  useSetHeader(undefined, undefined);

  const linhasFiltradas = useMemo(() => {
    if (!linhas.data) return [];
    const tokens = normalizeText(query).split(" ").filter(Boolean);
    if (tokens.length === 0) return linhas.data;

    return linhas.data.filter((l) => {
      const nome = normalizeText(l.nomeLinha);
      const cod = l.codLinha ? normalizeText(l.codLinha) : "";
      const horariosSemDoisPontos = l.horarios.map((h) => h.replace(":", ""));
      const locais = l.locais.map((loc) => normalizeText(loc));

      // Cada palavra digitada precisa achar algo (nome, código, horário ou
      // local do roteiro) — permite buscar "recife fortaleza", "apodi 18:45"
      // em qualquer ordem, ou uma cidade que só aparece como ponto de parada
      // (ex.: "Montes Claros" num trecho cujo título não a menciona).
      return tokens.every((t) => {
        const tSemDoisPontos = t.replace(":", "");
        return (
          nome.includes(t) ||
          cod.includes(t) ||
          l.horarios.some((h) => h.includes(t)) ||
          horariosSemDoisPontos.some((h) => h.includes(tSemDoisPontos)) ||
          locais.some((loc) => loc.includes(t))
        );
      });
    });
  }, [linhas.data, query]);

  return (
    <LinhaSearch
      query={query}
      onQuery={setQuery}
      linhas={linhasFiltradas}
      isLoading={linhas.isLoading}
      isError={linhas.isError}
      onRetry={() => linhas.refetch()}
      onSelect={(key) => navigate(`/linha/${encodeURIComponent(key)}`)}
      lastUpdated={lastUpdated.data ?? null}
    />
  );
}
