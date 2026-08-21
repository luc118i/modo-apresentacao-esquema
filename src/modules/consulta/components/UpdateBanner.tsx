import { RefreshCw } from "lucide-react";
import { EsquemaService } from "@/shared/services/EsquemaService";
import { useLastUpdated, useServerLastUpdated } from "../hooks/queries";

/** Avisa quando o esquema mudou desde que a página carregou, com botão pra recarregar. */
export function UpdateBanner() {
  const baseline = useLastUpdated();
  const server = useServerLastUpdated();

  const hasUpdate =
    !!server.data && !!baseline.data && server.data !== baseline.data;

  if (!hasUpdate) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-primary px-4 py-2 text-center text-sm text-white">
      <span>Este esquema está desatualizado.</span>
      <button
        onClick={() => {
          EsquemaService.clearLocalCache();
          window.location.reload();
        }}
        className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2"
      >
        <RefreshCw className="size-3.5" />
        Clique aqui para atualizá-lo
      </button>
    </div>
  );
}
