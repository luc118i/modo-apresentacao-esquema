import { useNavigate, useParams } from "react-router-dom";
import { useSetHeader } from "@/app/HeaderSlot";
import { esquemaSlug } from "@/shared/lib/esquemaSlug";
import { EsquemaPicker } from "../components/EsquemaPicker";
import { useEsquemasByLinha, useLastUpdated } from "../hooks/queries";

export function EsquemaPickerPage() {
  const { linhaKey = "" } = useParams<{ linhaKey: string }>();
  const navigate = useNavigate();
  const esquemas = useEsquemasByLinha(linhaKey);
  const lastUpdated = useLastUpdated();

  // Header (nome + código da linha) vem do próprio esquema — todos do grupo compartilham.
  const primeiro = esquemas.data?.[0];
  const titulo = primeiro
    ? primeiro.codLinha
      ? `${primeiro.nomeLinha} · ${primeiro.codLinha}`
      : primeiro.nomeLinha
    : "";

  useSetHeader(() => navigate("/"), titulo);

  return (
    <>
      <h2 className="text-xs font-medium uppercase tracking-wide text-text-subtle">
        Escolha o horário
      </h2>
      <EsquemaPicker
        esquemas={esquemas.data ?? []}
        isLoading={esquemas.isLoading}
        onSelect={(esquema) => navigate(`/esquema/${esquemaSlug(esquema)}`)}
        lastUpdated={lastUpdated.data ?? null}
      />
    </>
  );
}
