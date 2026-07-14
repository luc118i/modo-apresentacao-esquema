import { useIsFetching } from "@tanstack/react-query";

/**
 * Barra fina no topo que aparece enquanto houver qualquer requisição em
 * andamento (TanStack Query). Feedback global, complementa os skeletons.
 */
export function GlobalLoadingBar() {
  const isFetching = useIsFetching();
  if (!isFetching) return null;

  return (
    <div
      role="progressbar"
      aria-label="Carregando"
      className="fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden bg-primary-soft"
    >
      <div
        className="absolute inset-y-0 rounded-full bg-primary"
        style={{ animation: "loading-indeterminate 1.15s ease-in-out infinite" }}
      />
    </div>
  );
}
