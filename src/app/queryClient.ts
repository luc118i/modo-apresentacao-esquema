import { QueryClient } from "@tanstack/react-query";

/**
 * Singleton — usado pelo Provider (React) e também importado direto pelo
 * EsquemaService pra invalidar queries depois de uma revalidação em segundo
 * plano (fora de componentes, sem precisar de contexto).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
