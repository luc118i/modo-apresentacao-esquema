/**
 * Gera os mocks (src/shared/services/mock/*.json) a partir das CSVs exportadas
 * do Google Sheets. Regenere sempre que exportar a planilha atualizada:
 *
 *   node scripts/build-mock.mjs "<pasta com as CSVs>"
 *
 * Espera dois arquivos na pasta:
 *   "LOCAIS LIFE - ESQUEMAS.csv"         (ID_ESQUEMA, NOME_LINHA, HORARIO, SENTIDO)
 *   "LOCAIS LIFE - ESQUEMA_PONTOS.csv"   (ID_ESQUEMA, ORDEM, ID_PONTO, NOME_PONTO,
 *                                         TIPO, horario_comercial, tempo_local,
 *                                         tipo_trecho, [4 colunas de tipo de operação])
 *   "LOCAIS LIFE - LOCAIS.csv"           (Código, ..., Rodoviária S/N, ...) — fonte
 *                                         do tipo do local (Rodoviária/Ponto de apoio)
 *   "LOCAIS LIFE - TEMPO_PERMANENCIA.csv"(ORIGEM, Tempo de Permanencia HH:MM, COD_LOCAL)
 *                                         — permanência das rodoviárias (apoio = 30 min fixo)
 *
 * A coluna TIPOS_PARADA é opcional (separador , ; ou |). Quando presente, ela
 * alimenta as tags do card; quando ausente, o app cai numa heurística por nome.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR =
  process.argv[2] ?? "C:/Users/catedral 1/Desktop/PROJETOS/ANALISE_VIAGEM";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "../src/shared/services/mock");

function splitCsv(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parse(file) {
  const raw = readFileSync(join(DIR, file), "utf8").replace(/^﻿/, "");
  const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);
  const header = splitCsv(lines[0]);
  return lines.slice(1).map((l) => {
    const cells = splitCsv(l);
    const row = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

function parseTipo(tipo) {
  const m = tipo.match(/^(.*?)\s*-\s*(\d+)\s*$/);
  return m ? { label: m[1].trim(), codigo: Number(m[2]) } : { label: tipo.trim(), codigo: null };
}

const esquemasRaw = parse("LOCAIS LIFE - ESQUEMAS.csv");
const pontosRaw = parse("LOCAIS LIFE - ESQUEMA_PONTOS.csv");
const withPontos = new Set(pontosRaw.map((p) => Number(p.ID_ESQUEMA)));

/**
 * Detecta as colunas de tipo de ponto no cabeçalho (marcadas com "x" ou branco).
 * Aceita as colunas: Embarque/Desemb., Alimentação, Troca de Motorista, Abastecimento.
 */
const norm = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
function detectTagColumns(header) {
  const map = {}; // tagKey -> nome real da coluna
  for (const h of header) {
    const n = norm(h);
    if (n.includes("EMBARQUE") || n.includes("DESEMB")) map.embarque = h;
    else if (n.includes("ALIMENTA")) map.alimentacao = h;
    else if (n.includes("TROCA") || n.includes("MOTORISTA")) map.troca = h;
    else if (n.includes("ABASTEC")) map.abastece = h;
  }
  return map;
}
const isMarked = (v) => ["X", "SIM", "1", "TRUE", "✓"].includes((v ?? "").trim().toUpperCase());
const tagColumns = detectTagColumns(Object.keys(pontosRaw[0] ?? {}));

/**
 * Planilha de LOCAIS: fonte autoritativa do tipo do local por ID_PONTO (= Código).
 * Coluna "Rodoviária" = S/N. join por Código.
 */
function findCol(header, target) {
  return header.find((h) => norm(h) === norm(target)) ?? target;
}
const locaisRodoviaria = new Map(); // idPonto -> boolean | undefined
try {
  const locais = parse("LOCAIS LIFE - LOCAIS.csv");
  const header = Object.keys(locais[0] ?? {});
  const colCod = findCol(header, "Código");
  const colRod = findCol(header, "Rodoviária");
  for (const row of locais) {
    const cod = Number(row[colCod]);
    if (!Number.isNaN(cod)) locaisRodoviaria.set(cod, /^S/i.test((row[colRod] ?? "").trim()));
  }
} catch {
  console.log("aviso: LOCAIS não encontrada — tipo do local cairá na heurística por nome");
}

/**
 * Aba TEMPO_PERMANENCIA: tempo de permanência (HH:MM) por local, join COD_LOCAL = ID_PONTO.
 * O app aplica a regra: rodoviária segue este tempo; ponto de apoio = 30 min fixo.
 */
const hhmmToMin = (v) => {
  const m = (v ?? "").trim().match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
const permanenciaMin = new Map(); // idPonto -> minutos
try {
  const tp = parse("LOCAIS LIFE - TEMPO_PERMANENCIA.csv");
  const header = Object.keys(tp[0] ?? {});
  const colCod = findCol(header, "COD_LOCAL");
  const colTempo = findCol(header, "Tempo de Permanencia");
  for (const row of tp) {
    const cod = Number(row[colCod]);
    const min = hhmmToMin(row[colTempo]);
    if (!Number.isNaN(cod) && row[colCod] !== "" && min != null) permanenciaMin.set(cod, min);
  }
} catch {
  console.log("aviso: TEMPO_PERMANENCIA não encontrada — permanência de rodoviária ficará vazia");
}

const esquemas = esquemasRaw
  .filter((e) => withPontos.has(Number(e.ID_ESQUEMA)))
  .map((e) => ({
    id: Number(e.ID_ESQUEMA),
    nomeLinha: e.NOME_LINHA.trim(),
    horario: e.HORARIO.trim(),
    sentido: /volta/i.test(e.SENTIDO) ? "Volta" : "Ida",
  }))
  .sort((a, b) => a.id - b.id);

const pontos = pontosRaw
  .map((p) => ({
    idEsquema: Number(p.ID_ESQUEMA),
    ordem: Number(p.ORDEM),
    idPonto: Number(p.ID_PONTO),
    nome: p.NOME_PONTO.trim(),
    tipo: parseTipo(p.TIPO),
    rodoviaria: locaisRodoviaria.has(Number(p.ID_PONTO))
      ? locaisRodoviaria.get(Number(p.ID_PONTO))
      : null,
    tempoPermanencia: permanenciaMin.has(Number(p.ID_PONTO))
      ? permanenciaMin.get(Number(p.ID_PONTO))
      : null,
    horarioComercial: p.horario_comercial?.trim() || null,
    tempoLocal: p.tempo_local?.trim() ? Number(p.tempo_local) : null,
    tipoTrecho: p.tipo_trecho?.trim() || null,
    tiposParada: (() => {
      const keys = Object.entries(tagColumns)
        .filter(([, col]) => isMarked(p[col]))
        .map(([key]) => key);
      return keys.length ? keys : null;
    })(),
  }))
  .sort((a, b) => a.idEsquema - b.idEsquema || a.ordem - b.ordem);

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "esquemas.json"), JSON.stringify(esquemas, null, 2));
writeFileSync(join(OUT, "pontos.json"), JSON.stringify(pontos, null, 2));
const cols = Object.keys(tagColumns);
const comTipo = pontos.filter((p) => p.rodoviaria !== null).length;
console.log(`esquemas com pontos: ${esquemas.length} · pontos: ${pontos.length}`);
console.log(`tipo do local (LOCAIS.Rodoviária) preenchido em ${comTipo}/${pontos.length} pontos`);
console.log(
  cols.length
    ? `colunas de tipo detectadas: ${cols.join(", ")}`
    : "nenhuma coluna de tipo na planilha ainda — usando heurística por nome no app",
);
