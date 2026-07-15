import { normalizeText } from "@/shared/lib/normalize";
import type { Esquema } from "@/shared/models/esquema";
import { TIPO_PONTO, type Ponto } from "@/shared/models/ponto";

export type TagKey = "embarque" | "alimentacao" | "troca" | "abastece";

export const TAGS: Record<TagKey, { label: string; c: string; bg: string; dot: string }> = {
  embarque: { label: "Embarque / Desemb.", c: "#C2410C", bg: "#FFF1E8", dot: "#F55807" },
  alimentacao: { label: "Alimentação", c: "#92610A", bg: "#FBF1DC", dot: "#CA8A04" },
  troca: { label: "Troca de motorista", c: "#1E4ED8", bg: "#EAF0FF", dot: "#2563EB" },
  abastece: { label: "Abastecimento", c: "#157A3A", bg: "#E8F6EC", dot: "#16A34A" },
};

export const LEGEND = [
  { label: "Embarque / Desembarque", dot: "#F55807" },
  { label: "Alimentação", dot: "#CA8A04" },
  { label: "Troca de motorista", dot: "#2563EB" },
  { label: "Abastecimento", dot: "#16A34A" },
];

/**
 * Minutos extras quando o ponto acumula operação além de Embarque/Desemb.,
 * somados ao tempo base (aba TEMPO_PERMANENCIA) só quando há horário comercial —
 * mesma regra do Gestão de Esquemas (EsqScripts.html: TIPO_PARADA_BONUS_MIN).
 */
const TAG_BONUS_MIN: Partial<Record<TagKey, number>> = { alimentacao: 30, troca: 15, abastece: 15 };

const UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB",
  "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);
const VENUES = ["RODOVIARIA", "GARAGEM", "TERMINAL", "POSTO", "CHURRASCARIA", "RESTAURANTE"];

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\p{L}[\p{L}']*/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1))
    .trim();
}

/** Extrai a UF (aceita "BSB" como DF) varrendo os tokens do nome. */
function extractUf(nome: string): string | null {
  const tokens = normalizeText(nome).split(/[^A-Z]+/).filter(Boolean);
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i] === "BSB") return "DF";
    if (UFS.has(tokens[i])) return tokens[i];
  }
  return null;
}

/** Remove uma UF no fim do texto ("... - CE" ou "... CE"), com ou sem acento. */
function stripTrailingUf(value: string): string {
  return value
    .replace(/[\s-]+([A-Za-zÀ-ÿ]{2,3})\s*$/, (full, uf: string) => {
      const n = normalizeText(uf);
      return UFS.has(n) || n === "BSB" ? "" : full;
    })
    .trim();
}

/** Remove um prefixo de local ("RODOVIARIA DE ...") comparando sem acento. */
function stripLeadingVenue(value: string): { rest: string; venue: string } {
  const re = new RegExp(`^(${VENUES.join("|")})\\s+(DE\\s+|DA\\s+|DO\\s+)?`);
  const m = normalizeText(value).match(re);
  if (m) return { rest: value.slice(m[0].length).trim(), venue: titleCase(m[1]) };
  return { rest: value, venue: "" };
}

/** Separa "RODOVIARIA FORTALEZA - CE" em cidade + local (subtítulo). */
function splitCityPlace(nome: string): { city: string; place: string } {
  const base = nome.replace(/\s+/g, " ").trim();
  const slash = base.indexOf("/");
  const cityPart = slash >= 0 ? base.slice(0, slash) : base;
  const placePart = slash >= 0 ? base.slice(slash + 1) : "";

  const { rest, venue } = stripLeadingVenue(cityPart);
  const city = titleCase(stripTrailingUf(rest) || stripTrailingUf(cityPart));
  const place = placePart ? titleCase(placePart) : venue;
  return { city, place };
}

/** Reconhece chaves ou rótulos em português vindos da planilha. */
function parseTagToken(raw: string): TagKey | null {
  const t = normalizeText(raw);
  if (/EMBARQUE|DESEMB/.test(t)) return "embarque";
  if (/ALIMENTA|REFEICAO|COMIDA|LANCHE/.test(t)) return "alimentacao";
  if (/TROCA|MOTORISTA|RENDICAO/.test(t)) return "troca";
  if (/ABASTEC|COMBUSTIVEL|POSTO/.test(t)) return "abastece";
  return null;
}

function tagsFromPlanilha(ponto: Ponto): TagKey[] {
  if (!ponto.tiposParada?.length) return [];
  const keys = ponto.tiposParada.map(parseTagToken).filter((k): k is TagKey => k != null);
  return [...new Set(keys)];
}

/** Fallback heurístico enquanto a planilha não traz a coluna TIPOS_PARADA. */
function heuristicTags(ponto: Ponto): TagKey[] {
  const n = normalizeText(ponto.nome);
  const tags = new Set<TagKey>();
  if (ponto.tipo.codigo === TIPO_PONTO.CONTROLE || ponto.tipo.codigo === TIPO_PONTO.FECHAMENTO)
    tags.add("embarque");
  if (/CHURRASCARIA|RESTAURANTE|CHIMARRAO|GRILL|LANCHONETE|\bREST\b|KAMBUI|CHURR/.test(n))
    tags.add("alimentacao");
  if (/\bPOSTO\b/.test(n)) tags.add("abastece");
  if (tags.size === 0) tags.add("embarque");
  return [...tags];
}

function inferTags(ponto: Ponto): TagKey[] {
  const fromSheet = tagsFromPlanilha(ponto);
  return fromSheet.length ? fromSheet : heuristicTags(ponto);
}

export type TipoLocal = "Rodoviária" | "Ponto de apoio";

export type RoteiroStop = {
  ord: number;
  /** Cidade + UF, ex.: "Taguatinga - DF". */
  cidade: string;
  /** Nome do ponto de apoio (só quando não é rodoviária), ex.: "Churrascaria Beira Rio". */
  place: string;
  /** Tipo do local: só Rodoviária ou Ponto de apoio. */
  tipoLocal: TipoLocal;
  tags: TagKey[];
  /** Horário de sessão (coluna horario_comercial). */
  horaComercial: string;
  /** Tempo de permanência no ponto (coluna tempo_local), ex.: "05 min". */
  minLabel: string;
  origin: boolean;
  vetado: boolean;
};

export type RoteiroViewModel = {
  origem: string;
  destino: string;
  ufOrigem: string;
  ufDestino: string;
  saida: string;
  sentido: string;
  totalParadas: number;
  stops: RoteiroStop[];
};

function tipoLocalDe(ponto: Ponto): TipoLocal {
  // Fonte autoritativa: LOCAIS.Rodoviária. Sem ela, heurística por nome.
  if (ponto.rodoviaria != null) return ponto.rodoviaria ? "Rodoviária" : "Ponto de apoio";
  return /RODOVIARIA|TERMINAL/.test(normalizeText(ponto.nome)) ? "Rodoviária" : "Ponto de apoio";
}

export function buildRoteiro(esquema: Esquema, pontos: Ponto[]): RoteiroViewModel {
  const raw = pontos.map((p, i) => {
    const { city, place } = splitCityPlace(p.nome);
    return { p, i, city, place, uf: extractUf(p.nome) ?? "", tipoLocal: tipoLocalDe(p) };
  });

  const stops: RoteiroStop[] = raw.map(({ p, i, city, place, uf, tipoLocal }) => {
    const tags = inferTags(p);
    // Permanência: ponto de apoio = 30 min fixo. Rodoviária segue o Gestão de
    // Esquemas: tempo_local (ajuste manual salvo) tem prioridade; sem ele, usa
    // a aba TEMPO_PERMANENCIA + bônus por tag (Alimentação/Troca/Abastecimento)
    // quando há horário comercial — mesma regra de EsqScripts.html (_getStopTime).
    const bonus = tags.reduce((sum, t) => sum + (TAG_BONUS_MIN[t] ?? 0), 0);
    const permMin =
      tipoLocal === "Ponto de apoio"
        ? 30
        : p.tempoLocal != null
          ? p.tempoLocal
          : p.tempoPermanencia != null
            ? p.tempoPermanencia + (p.horarioComercial ? bonus : 0)
            : 5;
    return {
      ord: p.ordem,
      cidade: uf ? `${city} - ${uf}` : city,
      place: tipoLocal === "Ponto de apoio" ? place : "",
      tipoLocal,
      tags,
      horaComercial: p.horarioComercial ?? "",
      minLabel: permMin != null ? `${String(permMin).padStart(2, "0")} min` : "",
      origin: i === 0,
      vetado: p.tipo.codigo === TIPO_PONTO.NAO_AUTORIZADO,
    };
  });

  const first = raw[0];
  const last = raw[raw.length - 1];

  return {
    origem: first?.city ?? "",
    destino: last?.city ?? "",
    ufOrigem: first?.uf ?? "",
    ufDestino: last?.uf ?? "",
    saida: esquema.horario,
    sentido: esquema.sentido,
    totalParadas: stops.length,
    stops,
  };
}
