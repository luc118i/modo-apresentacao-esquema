/**
 * Uma "linha" agrupa vários esquemas (Ida/Volta, horários diferentes) sob o
 * mesmo COD_LINHA. Quando o esquema não tem código embutido em NOME_LINHA,
 * o agrupamento cai no texto exato do nome (sem fuzzy matching).
 */
export type Linha = {
  key: string;
  nomeLinha: string;
  codLinha: string | null;
  esquemaIds: number[];
  totalEsquemas: number;
  /** Horários (partida) distintos entre os esquemas do grupo — usado na busca. */
  horarios: string[];
  /** Nomes de pontos do roteiro, únicos entre os esquemas do grupo — busca por local. */
  locais: string[];
};
