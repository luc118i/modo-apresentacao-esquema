# Fotos das cidades (opcional)

O card de linha mostra uma foto da cidade de origem e outra da cidade de
destino, lado a lado. Cidades sem foto caem automaticamente num gradiente
genérico — nenhuma linha fica sem imagem, com ou sem esse arquivo.

Para adicionar uma foto real:

1. Salve a imagem aqui dentro (`src/assets/cidades/`), formato `.jpg`,
   `.jpeg`, `.png` ou `.webp`.
2. Nomeie o arquivo com a cidade em minúsculas, sem acento, espaços viram
   `-`, e a UF no final separada por `-`:

   ```
   fortaleza-ce.jpg
   sao-paulo-sp.jpg
   belo-horizonte-mg.jpg
   ```

3. Pronto — não precisa mexer em nenhum código. O app detecta o arquivo
   sozinho no próximo build/reload (via `import.meta.glob`, em
   `src/modules/consulta/lib/cidadeImagem.ts`).

Se quiser uma foto que sirva pra qualquer UF (sem cidade específica), pode
nomear só com a UF: `ce.jpg`, `sp.jpg` — é usado como fallback antes do
gradiente genérico.

## Depois de baixar todas as fotos

O card mostra a foto pequena (~320px de largura), então a original em alta
resolução só pesa o app à toa. Rode:

```bash
npm run optimize:cidades
```

Isso redimensiona cada `.jpg`/`.jpeg`/`.png` pra no máximo 960px de largura e
converte pra `.webp` (qualidade 78), apagando o arquivo original. Normalmente
reduz o tamanho em 80-95%. Pode rodar de novo a qualquer momento — só reprocessa
arquivos que ainda estiverem em `.jpg/.jpeg/.png` (já convertidos ficam `.webp`
e são ignorados).
