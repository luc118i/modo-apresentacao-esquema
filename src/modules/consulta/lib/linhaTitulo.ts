import { normalizeText } from "@/shared/lib/normalize";

const UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB",
  "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\p{L}[\p{L}']*/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1))
    .trim();
}

export type CidadeUf = { cidade: string; uf: string };

/**
 * Extrai cidade + UF de uma metade do título da linha. Aceita "(UF)" com ou
 * sem espaço antes, UF solta no fim ("... - CE"), e um sufixo "VIA <cidade>"
 * (linha com escala) que é descartado — só a cidade-alvo importa pro card.
 */
function parseMetade(raw: string, ufFallback: string | null): CidadeUf {
  let s = raw.trim();

  // "... VIA UBERLANDIA" / "... via Uberlândia" — escala, não é o destino.
  s = s.replace(/\s+VIA\s+.+$/i, "").trim();

  let uf = ufFallback ?? "";
  const paren = s.match(/\(([A-Za-zÀ-ÿ]{2})\)\s*$/);
  if (paren && UFS.has(normalizeText(paren[1]))) {
    uf = normalizeText(paren[1]);
    s = s.slice(0, paren.index).trim();
  } else {
    const trailing = s.match(/[\s-]+([A-Za-zÀ-ÿ]{2})\s*$/);
    if (trailing && UFS.has(normalizeText(trailing[1]))) {
      uf = normalizeText(trailing[1]);
      s = s.slice(0, trailing.index).trim();
    }
  }

  return { cidade: titleCase(s), uf };
}

/** Separador principal entre origem/destino: " X " tem prioridade sobre " - ". */
function splitTitulo(nome: string): [string, string] | null {
  const porX = nome.split(/\s+X\s+/i);
  if (porX.length === 2) return [porX[0], porX[1]];

  const porTraco = nome.split(/\s+-\s+/);
  if (porTraco.length === 2) return [porTraco[0], porTraco[1]];

  return null;
}

/**
 * Cidade + UF de origem/destino a partir do título da linha (`nomeLinha`).
 * Quando o título não traz UF (ex.: "BARREIRAS X GOIÂNIA"), usa o `codLinha`
 * como fallback — os 4 primeiros caracteres codificam UF-origem+UF-destino
 * (ex.: "BAGO0053051" = BA → GO), convenção observada na planilha.
 */
export function parseLinhaTitulo(
  nomeLinha: string,
  codLinha: string | null,
): { origem: CidadeUf; destino: CidadeUf } {
  const partes = splitTitulo(nomeLinha.trim());

  let ufOrigemCod: string | null = null;
  let ufDestinoCod: string | null = null;
  if (codLinha && /^[A-Za-z]{4}/.test(codLinha)) {
    const a = normalizeText(codLinha.slice(0, 2));
    const b = normalizeText(codLinha.slice(2, 4));
    if (UFS.has(a) && UFS.has(b)) {
      ufOrigemCod = a;
      ufDestinoCod = b;
    }
  }

  if (!partes) {
    const cidade = titleCase(nomeLinha);
    return {
      origem: { cidade, uf: ufOrigemCod ?? "" },
      destino: { cidade, uf: ufDestinoCod ?? "" },
    };
  }

  return {
    origem: parseMetade(partes[0], ufOrigemCod),
    destino: parseMetade(partes[1], ufDestinoCod),
  };
}
