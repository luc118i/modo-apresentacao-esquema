# Esquemas — Consulta de Roteiros

App interna para consultar esquemas de viagem: busca por linha → escolhe horário/sentido → vê o roteiro de pontos.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + build de produção
npm run lint
```

## Arquitetura (app única, feature-first)

```
src/
├── app/            providers, router, layouts
├── modules/
│   └── consulta/   components, hooks, pages  ← regra de negócio da consulta
├── shared/
│   ├── ui/         primitivos (Button, Card, Badge, Skeleton…)
│   ├── services/   EsquemaService (fonte única de dados) + apiClient
│   ├── models/     tipos + schemas Zod (Esquema, Ponto, Linha)
│   └── lib/        cn, normalize, useTheme
├── styles/         design tokens (light + dark)
└── config/         flags e URL da API
```

Regra: **componente não conhece a planilha, página não faz fetch, hook é o "controller".**
`useConsulta()` orquestra as queries e devolve o viewmodel; a página só renderiza.

## Trocar o mock pela API real (Apps Script)

Hoje os dados vêm de `src/shared/services/mock/*.json` (gerados das planilhas — só os
40 esquemas que têm pontos). Quando o endpoint estiver pronto:

1. Defina `VITE_API_URL` (`.env`) → `config.useMock` vira `false` automaticamente.
2. Implemente os métodos de `EsquemaService` usando `apiClient`. **A assinatura não muda**,
   então nenhum hook ou componente é tocado.

## Dados

Duas abas, relação pai-filho por `ID_ESQUEMA`. O `NOME_LINHA` é bruto e inconsistente;
`shared/lib/normalize.ts` gera a forma canônica (origem ⇄ destino) usada para agrupar e buscar.

Os mocks em `src/shared/services/mock/*.json` são gerados das CSVs:

```bash
node scripts/build-mock.mjs "<pasta com as CSVs>"
```

**Tipos de parada (tags do card):** adicione na aba `ESQUEMA_PONTOS` quatro colunas
booleanas, uma por tipo — marque com `x` (verdadeiro) ou deixe em branco (falso). Um
ponto pode ter mais de um tipo marcado; todos aparecem no card:

| Coluna              | Tag exibida          |
| ------------------- | -------------------- |
| `Embarque/Desemb.`  | Embarque / Desemb.   |
| `Alimentação`       | Alimentação          |
| `Troca de Motorista`| Troca de motorista   |
| `Abastecimento`     | Abastecimento        |

Os nomes das colunas são detectados de forma tolerante (com/sem acento). Enquanto
as colunas não existirem, `modules/consulta/lib/roteiro.ts` usa uma heurística por
nome do ponto.

Cada parada exibe, de forma clara e rotulada:

- **Cidade - UF** (ex.: "Taguatinga - DF");
- **Tipo do local** — só **Rodoviária** ou **Ponto de apoio**, vindo da coluna
  `Rodoviária` (S/N) da aba **LOCAIS** (join por `Código` = `ID_PONTO`, hoje 793/793);
- **Sessão** — `horario_comercial`;
- **Permanência** — regra: **rodoviária** segue a aba `LOCAIS LIFE - TEMPO_PERMANENCIA.csv`
  (coluna `Tempo de Permanencia`, join `COD_LOCAL` = `ID_PONTO`); **ponto de apoio** = **30 min fixo**;
- **Operação no ponto** — as tags booleanas acima.

Por isso o gerador de mock também lê `LOCAIS LIFE - LOCAIS.csv` e
`LOCAIS LIFE - TEMPO_PERMANENCIA.csv`.

Assets oficiais em `public/` (`catedral-logo.png`, `catedral-bus.jpg`); há fallback
SVG em `components/roteiro/assets.tsx` caso sumam.

## Roadmap

- **Fase 1 (feito):** fundação, design system, consulta com estados loading/vazio/erro, dark mode.
- **Fase 2:** refinos de busca, responsividade fina, acessibilidade.
- **Fase 3:** admin, PWA, compartilhamento por link, PDF.
