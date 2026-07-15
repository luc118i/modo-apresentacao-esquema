import { z } from "zod";

export const tipoPontoSchema = z.object({
  label: z.string(),
  codigo: z.number().nullable(),
});
export type TipoPonto = z.infer<typeof tipoPontoSchema>;

export const pontoSchema = z.object({
  idEsquema: z.number(),
  ordem: z.number(),
  idPonto: z.number(),
  nome: z.string(),
  tipo: tipoPontoSchema,
  horarioComercial: z.string().nullable(),
  tempoLocal: z.number().nullable(),
  /** Tipo de trecho (BR/Urb/Est/Mun) ou "Pers:NN" (trecho pessoal/percentual). Não usado em lógica de UI. */
  tipoTrecho: z.string().nullable(),
  /** Tipos de parada vindos da planilha (colunas booleanas). Vazio = usar heurística. */
  tiposParada: z.array(z.string()).nullable().default(null),
  /** Da planilha LOCAIS (coluna Rodoviária S/N). null = usar heurística por nome. */
  rodoviaria: z.boolean().nullable().default(null),
  /** Permanência em minutos da aba TEMPO_PERMANENCIA (join COD_LOCAL). null = sem registro. */
  tempoPermanencia: z.number().nullable().default(null),
});
export type Ponto = z.infer<typeof pontoSchema>;

/** Códigos de TIPO conhecidos (parte após o "-" no rótulo original). */
export const TIPO_PONTO = {
  FECHAMENTO: 1,
  AUXILIAR: 2,
  CONTROLE: 12,
  NAO_AUTORIZADO: 42,
} as const;
