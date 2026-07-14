import { CalendarX } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSetHeader } from "@/app/HeaderSlot";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Loading } from "@/shared/ui/Loading";
import { RoteiroCard } from "../components/roteiro/RoteiroCard";
import { useEsquemaBySlug, useLastUpdated, usePontos } from "../hooks/queries";

export function RoteiroPage() {
  const { slug = null } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const esquema = useEsquemaBySlug(slug);
  const pontos = usePontos(esquema.data?.id ?? null);
  const lastUpdated = useLastUpdated();

  const titulo = esquema.data
    ? esquema.data.codLinha
      ? `${esquema.data.nomeLinha} · ${esquema.data.codLinha}`
      : esquema.data.nomeLinha
    : "";

  const back = () => {
    // "default" = página aberta direto (link compartilhado), sem histórico no app.
    if (location.key === "default") navigate("/");
    else navigate(-1);
  };

  useSetHeader(back, titulo, true);

  if (esquema.isLoading || (esquema.data && pontos.isLoading)) return <Loading />;

  if (!esquema.data || !pontos.data || pontos.data.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Esquema não encontrado"
        description="O link pode estar incorreto ou o esquema não existe mais."
      />
    );
  }

  return (
    <RoteiroCard esquema={esquema.data} pontos={pontos.data} lastUpdated={lastUpdated.data ?? null} />
  );
}
