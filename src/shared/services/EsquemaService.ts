import { config } from "@/config";
import { normalizeText } from "@/shared/lib/normalize";
import { idFromSlug } from "@/shared/lib/esquemaSlug";
import { esquemaSchema, type Esquema } from "@/shared/models/esquema";
import { pontoSchema, type Ponto } from "@/shared/models/ponto";
import type { Linha } from "@/shared/models/linha";
import { queryClient } from "@/app/queryClient";
import { apiClient } from "./apiClient";
import esquemasData from "./mock/esquemas.json";
import pontosData from "./mock/pontos.json";
import metaData from "./mock/meta.json";

const mockPontos: Ponto[] = pontoSchema.array().parse(pontosData);

/** Mock não tem pontosNomes na origem — enriquece com os nomes vindos de mockPontos (busca por local). */
function withPontosNomes(esquemas: Esquema[]): Esquema[] {
  const porEsquema = new Map<number, string[]>();
  for (const p of mockPontos) {
    const lista = porEsquema.get(p.idEsquema) ?? [];
    lista.push(p.nome);
    porEsquema.set(p.idEsquema, lista);
  }
  return esquemas.map((e) => ({ ...e, pontosNomes: porEsquema.get(e.id) ?? [] }));
}

const mockEsquemas: Esquema[] = withPontosNomes(esquemaSchema.array().parse(esquemasData));

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

/** Só a data de última atualização, sem re-buscar a lista inteira (mock ou API). */
async function fetchServerLastUpdated(): Promise<string | null> {
  if (config.useMock) {
    await delay();
    return metaData.lastUpdated;
  }
  const { data } = await apiClient.get("", { params: { action: "getMeta" } });
  return typeof data?.lastUpdated === "string" ? data.lastUpdated : null;
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

// ── Cache persistente (localStorage) ──────────────────────────────────────
// Evita mostrar o skeleton de novo a cada visita: a primeira renderização usa
// o que já está salvo no navegador (instantâneo), enquanto uma checagem leve
// (?action=getMeta) roda em segundo plano. Só refaz a busca pesada e invalida
// as queries — atualizando a tela sozinha — quando a planilha realmente mudou.
const LS_KEY = "esquemas_cache_v1";

function readLocalCache(): EsquemasPayload | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const esquemas = esquemaSchema.array().safeParse(parsed.esquemas);
    if (!esquemas.success) return null;
    const lastUpdated = typeof parsed.lastUpdated === "string" ? parsed.lastUpdated : null;
    return { esquemas: esquemas.data, lastUpdated };
  } catch {
    return null;
  }
}

function writeLocalCache(payload: EsquemasPayload) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch {
    // localStorage indisponível/cheio — segue sem persistir, sem quebrar o app.
  }
}

/** Cache de sessão da lista de esquemas — deduplica as chamadas de getLinhas/getEsquemasByLinha. */
let esquemasCache: Promise<EsquemasPayload> | null = null;

function loadEsquemas(): Promise<EsquemasPayload> {
  if (esquemasCache) return esquemasCache;

  const cached = readLocalCache();
  if (cached) {
    esquemasCache = Promise.resolve(cached);
    revalidateInBackground(cached);
    return esquemasCache;
  }

  esquemasCache = fetchEsquemas().then((payload) => {
    writeLocalCache(payload);
    return payload;
  });
  return esquemasCache;
}

/** Checa (leve) se a planilha mudou desde o cache local; só refaz a busca pesada se mudou. */
async function revalidateInBackground(cached: EsquemasPayload): Promise<void> {
  try {
    const serverLastUpdated = await fetchServerLastUpdated();
    if (serverLastUpdated != null && serverLastUpdated === cached.lastUpdated) return;

    const fresh = await fetchEsquemas();
    writeLocalCache(fresh);
    esquemasCache = Promise.resolve(fresh);
    queryClient.invalidateQueries({ queryKey: ["linhas"] });
    queryClient.invalidateQueries({ queryKey: ["esquemas"] });
    queryClient.invalidateQueries({ queryKey: ["esquema"] });
    queryClient.invalidateQueries({ queryKey: ["pontos"] });
    queryClient.invalidateQueries({ queryKey: ["lastUpdated"] });
  } catch {
    // Sem rede/erro na checagem — mantém o cache local, tenta de novo na próxima visita.
  }
}

// ── Cache persistente dos pontos por esquema (localStorage) ───────────────
// Mesmo princípio do cache de esquemas: guarda o roteiro já buscado, marcado
// com o `lastUpdated` da planilha na hora da busca. Enquanto a planilha não
// mudar, visitas seguintes ao mesmo esquema usam o cache (instantâneo) em vez
// de esperar a API do Apps Script de novo.
const LS_KEY_PONTOS = "pontos_cache_v1";

type PontosCacheMap = Record<number, { pontos: Ponto[]; lastUpdated: string | null }>;

function readPontosCache(): PontosCacheMap {
  try {
    const raw = localStorage.getItem(LS_KEY_PONTOS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writePontosCacheEntry(idEsquema: number, pontos: Ponto[], lastUpdated: string | null) {
  try {
    const cache = readPontosCache();
    cache[idEsquema] = { pontos, lastUpdated };
    localStorage.setItem(LS_KEY_PONTOS, JSON.stringify(cache));
  } catch {
    // localStorage indisponível/cheio — segue sem persistir, sem quebrar o app.
  }
}

/** Chave de agrupamento: COD_LINHA (real, vindo da planilha) ou o nome exato, quando não há código. */
function linhaKey(e: Esquema): string {
  const cod = e.codLinha?.trim();
  return cod ? cod : normalizeText(e.nomeLinha);
}

/** Agrupa os esquemas por COD_LINHA (ou pelo nome exato, quando não há código). */
type LinhaAcc = Omit<Linha, "totalEsquemas" | "horarios" | "locais"> & {
  horarios: Set<string>;
  locais: Set<string>;
};

function buildLinhas(esquemas: Esquema[]): Linha[] {
  const map = new Map<string, LinhaAcc>();
  for (const e of esquemas) {
    const key = linhaKey(e);
    const found = map.get(key);
    if (found) {
      found.esquemaIds.push(e.id);
      found.horarios.add(e.horario);
      e.pontosNomes.forEach((nome) => found.locais.add(nome));
    } else
      map.set(key, {
        key,
        nomeLinha: e.nomeLinha,
        codLinha: e.codLinha?.trim() || null,
        esquemaIds: [e.id],
        horarios: new Set([e.horario]),
        locais: new Set(e.pontosNomes),
      });
  }
  return [...map.values()]
    .map((l) => ({
      ...l,
      totalEsquemas: l.esquemaIds.length,
      horarios: [...l.horarios].sort(),
      locais: [...l.locais],
    }))
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
    const found = esquemas.find((e) => e.id === id);
    if (found) return found;

    // Não achou no cache local — pode estar desatualizado (típico em link
    // compartilhado abrindo num navegador com cache antigo/vazio). Antes de
    // declarar "não encontrado", força uma busca fresca ignorando o cache.
    const fresh = await fetchEsquemas();
    writeLocalCache(fresh);
    esquemasCache = Promise.resolve(fresh);
    return fresh.esquemas.find((e) => e.id === id) ?? null;
  },

  async getPontos(idEsquema: number): Promise<Ponto[]> {
    const { lastUpdated } = await loadEsquemas();
    const cached = readPontosCache()[idEsquema];
    if (cached && cached.lastUpdated === lastUpdated) return cached.pontos;

    const pontos = await fetchPontos(idEsquema);
    writePontosCacheEntry(idEsquema, pontos, lastUpdated);
    return pontos;
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
    return fetchServerLastUpdated();
  },
};
