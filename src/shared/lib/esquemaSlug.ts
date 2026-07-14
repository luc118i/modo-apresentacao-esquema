import { normalizeText } from "@/shared/lib/normalize";
import type { Esquema } from "@/shared/models/esquema";

function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * URL amigável do esquema — ex.: "BAGO0053051-1730-ida-141". O ID no final é
 * quem resolve o link de verdade (estável); o resto (código/nome, horário,
 * sentido) é só cosmético — pode ficar desatualizado depois de uma edição
 * no GAS sem quebrar o link, já que a resolução usa o ID, não o texto.
 */
export function esquemaSlug(
  e: Pick<Esquema, "id" | "nomeLinha" | "codLinha" | "horario" | "sentido">,
): string {
  const base = e.codLinha?.trim() || slugify(e.nomeLinha);
  const hora = e.horario.replace(/[^0-9]/g, "");
  return `${base}-${hora}-${e.sentido.toLowerCase()}-${e.id}`;
}

/** Extrai o ID (sempre o último segmento) de um slug de esquema. */
export function idFromSlug(slug: string): number | null {
  const m = slug.match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
}
