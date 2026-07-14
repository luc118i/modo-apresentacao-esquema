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
    const q = normalizeText(query);
    if (!q) return linhas.data;
    return linhas.data.filter(
      (l) =>
        normalizeText(l.nomeLinha).includes(q) ||
        (l.codLinha && normalizeText(l.codLinha).includes(q)),
    );
  }, [linhas.data, query]);

  return (
    <LinhaSearch
      query={query}
      onQuery={setQuery}
      linhas={linhasFiltradas}
      isLoading={linhas.isLoading}
      isError={linhas.isError}
      onSelect={(key) => navigate(`/linha/${encodeURIComponent(key)}`)}
      lastUpdated={lastUpdated.data ?? null}
    />
  );
}
