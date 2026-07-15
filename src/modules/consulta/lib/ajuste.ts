import { config } from "@/config";

/** Abre o WhatsApp com o texto pronto pra solicitação de ajuste (mesmo número pra todo o app). */
export function abrirWhatsappAjuste(texto: string) {
  window.open(
    `https://wa.me/${config.whatsappAjuste}?text=${encodeURIComponent(texto)}`,
    "_blank",
    "noreferrer",
  );
}
