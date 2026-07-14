import { config } from "@/config";
import { normalizeText } from "@/shared/lib/normalize";
import { idFromSlug } from "@/shared/lib/esquemaSlug";
import { esquemaSchema, type Esquema } from "@/shared/models/esquema";
import { pontoSchema, type Ponto } from "@/shared/models/ponto";
import type { Linha } from "@/shared/models/linha";
import { apiClient } from "./apiClient";
import esquemasData from "./mock/esquemas.json";
import pontosData from "./mock/pontos.json";
import metaData from "./mock/meta.json";

const mockEsquemas: Esquema[] = esquemaSchema.array().parse(esquemasData);
const mockPontos: Ponto[] = pontoSchema.array().parse(pontosData);

const delay = () => new Promise((r) => setTimeout(r, config.mockDelayMs));

type EsquemasPayload = { esquemas: Esquema[]; lastUpdated: string | null };

/** Busca a lista de esquemas + data da última atualização da planilha (mock ou API). */
async function fetchEsquemas(): Promise<EsquemasPayload> {
  if (config.useMock) {
    await delay();
    return { esquemas: mockEsquemas, lastUpdated: metaData.lastUpdated };
  }
  const { data } = await apiClient.get("", { params: { action: "getLinhas" } });
  return {
    esquemas: esquemaSchema.array().parse(data?.esquemas ?? []),
    lastUpdated: typeof data?.lastUpdated === "string" ? data.lastUpdated : null,
  };
}

/** Busca os pontos de um esquema (mock ou API). */
async function fetchPontos(idEsquema: number): Promise<Ponto[]> {
  if (config.useMock) {
    await delay();
    return mockPontos.filter((p) => p.idEsquema === idEsquema).sort((a, b) => a.ordem - b.ordem);
  }
  const { data } = await apiClient.get("", { params: { action: "getRoteiro", id: idEsquema } });
  if (!data?.found) return [];
  return pontoSchema
    .array()
    .parse(data.pontos ?? [])
    .sort((a, b) => a.ordem - b.ordem);
}

/** Cache de sessão da lista de esquemas — deduplica as chamadas de getLinhas/getEsquemasByLinha. */
let esquemasCache: Promise<EsquemasPayload> | null = null;
function loadEsquemas(): Promise<EsquemasPayload> {
  if (!esquemasCache) esquemasCache = fetchEsquemas();
  return esquemasCache;
}

/** Chave de agrupamento: COD_LINHA (real, vindo da planilha) ou o nome exato, quando não há código. */
function linhaKey(e: Esquema): string {
  const cod = e.codLinha?.trim();
  return cod ? cod : normalizeText(e.nomeLinha);
}

/** Agrupa os esquemas por COD_LINHA (ou pelo nome exato, quando não há código). */
function buildLinhas(esquemas: Esquema[]): Linha[] {
  const map = new Map<string, Omit<Linha, "totalEsquemas">>();
  for (const e of esquemas) {
    const key = linhaKey(e);
    const found = map.get(key);
    if (found) found.esquemaIds.push(e.id);
    else
      map.set(key, {
        key,
        nomeLinha: e.nomeLinha,
        codLinha: e.codLinha?.trim() || null,
        esquemaIds: [e.id],
      });
  }
  return [...map.values()]
    .map((l) => ({ ...l, totalEsquemas: l.esquemaIds.length }))
    .sort((a, b) => a.nomeLinha.localeCompare(b.nomeLinha, "pt-BR"));
}

/**
 * Fonte única de dados de esquemas. `config.useMock` (true quando não há
 * `VITE_API_URL`) decide entre o mock local e a API do Apps Script. A assinatura
 * é a mesma nos dois casos, então nenhum hook ou componente muda.
 */
export const EsquemaService = {
  async getLinhas(): Promise<Linha[]> {
    const { esquemas } = await loadEsquemas();
    return buildLinhas(esquemas);
  },

  async getEsquemasByLinha(key: string): Promise<Esquema[]> {
    const { esquemas } = await loadEsquemas();
    return esquemas
      .filter((e) => linhaKey(e) === key)
      .sort((a, b) => a.sentido.localeCompare(b.sentido) || a.horario.localeCompare(b.horario));
  },

  /**
   * Resolve o slug legível da URL (ex.: "BAGO0053051-1730-ida-141") pro
   * esquema. A resolução usa só o ID no final — o resto do slug é cosmético,
   * então o link continua funcionando mesmo se horário/sentido mudarem depois.
   */
  async getEsquemaBySlug(slug: string): Promise<Esquema | null> {
    const id = idFromSlug(slug);
    if (id == null) return null;
    const { esquemas } = await loadEsquemas();
    return esquemas.find((e) => e.id === id) ?? null;
  },

  async getPontos(idEsquema: number): Promise<Ponto[]> {
    return fetchPontos(idEsquema);
  },

  /** Data da última modificação da planilha (mesma para todos os esquemas). */
  async getLastUpdated(): Promise<string | null> {
    const { lastUpdated } = await loadEsquemas();
    return lastUpdated;
  },

  /**
   * Checagem leve e SEMPRE fresca (ignora o cache de sessão) — usada só pelo
   * polling que avisa "dados novos disponíveis", sem re-buscar tudo.
   */
  async getServerLastUpdated(): Promise<string | null> {
    if (config.useMock) {
      await delay();
      return metaData.lastUpdated;
    }
    const { data } = await apiClient.get("", { params: { action: "getMeta" } });
    return typeof data?.lastUpdated === "string" ? data.lastUpdated : null;
  },
};
