/** Remove acentos (NFD) — base para busca e agrupamento. */
export function foldAccents(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/** Uppercase, sem acento, espaços colapsados. Chave de comparação textual. */
export function normalizeText(value: string): string {
  return foldAccents(value).toUpperCase().replace(/\s+/g, " ").trim();
}

