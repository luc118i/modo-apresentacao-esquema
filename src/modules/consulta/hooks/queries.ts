import { useQuery } from "@tanstack/react-query";
import { EsquemaService } from "@/shared/services/EsquemaService";

export function useLinhas() {
  return useQuery({ queryKey: ["linhas"], queryFn: () => EsquemaService.getLinhas() });
}

export function useEsquemasByLinha(linhaKey: string | null) {
  return useQuery({
    queryKey: ["esquemas", linhaKey],
    queryFn: () => EsquemaService.getEsquemasByLinha(linhaKey!),
    enabled: linhaKey != null,
  });
}

export function usePontos(esquemaId: number | null) {
  return useQuery({
    queryKey: ["pontos", esquemaId],
    queryFn: () => EsquemaService.getPontos(esquemaId!),
    enabled: esquemaId != null,
  });
}

export function useEsquemaBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["esquema", slug],
    queryFn: () => EsquemaService.getEsquemaBySlug(slug!),
    enabled: slug != null,
  });
}

export function useLastUpdated() {
  return useQuery({ queryKey: ["lastUpdated"], queryFn: () => EsquemaService.getLastUpdated() });
}

const POLL_INTERVAL_MS = 3 * 60 * 1000;

/** Checagem periódica (sempre fresca) usada só pelo aviso de "dados novos". */
export function useServerLastUpdated() {
  return useQuery({
    queryKey: ["serverLastUpdated"],
    queryFn: () => EsquemaService.getServerLastUpdated(),
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}
