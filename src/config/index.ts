/**
 * Configuração central. Troque USE_MOCK para false e defina VITE_API_URL
 * quando o endpoint do Apps Script estiver pronto — nenhum componente muda.
 */
export const config = {
  useMock: import.meta.env.VITE_API_URL ? false : true,
  apiUrl: import.meta.env.VITE_API_URL ?? "",
  /** Atraso simulado do mock, para exercitar estados de carregamento. */
  mockDelayMs: 350,
  /** Crédito exibido no rodapé do roteiro. */
  credit: {
    name: "Lucas Inácio",
    url: "https://github.com/luc118i",
  },
  /** Número que recebe as solicitações de ajuste via WhatsApp (formato internacional, só dígitos). */
  whatsappAjuste: "556199089050",
} as const;
