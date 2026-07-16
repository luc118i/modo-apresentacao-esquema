/**
 * Otimiza as fotos de cidade (src/assets/cidades/) depois que você terminar
 * de baixar/soltar as originais na pasta:
 *
 *   node scripts/optimize-cidades.mjs
 *
 * O card mostra a foto numa metade pequena (~320px de largura mesmo em tela
 * grande), então não precisa da foto original em alta resolução. Pra cada
 * .jpg/.jpeg/.jfif/.png/.webp encontrado: redimensiona (só encolhe, nunca
 * aumenta) pra no máximo 960px de largura — suficiente pra tela retina — e
 * (re)converte pra .webp com qualidade 78 (bom equilíbrio tamanho/nitidez pra
 * foto de cidade). Um .webp já otimizado que passar de novo pelo script só
 * fica alguns bytes diferente (reencode); não tem problema rodar de novo.
 */
import { readdirSync, statSync, unlinkSync, renameSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// No Windows, o libvips às vezes mantém o arquivo de origem "preso" por um
// instante depois do toFile() resolver — desliga o cache interno do sharp
// pra ele soltar o handle assim que termina, em vez de manter em memória.
sharp.cache(false);

const DIR = fileURLToPath(new URL("../src/assets/cidades", import.meta.url));
const MAX_WIDTH = 960;
const QUALITY = 78;
const ORIGINAIS = new Set([".jpg", ".jpeg", ".jfif", ".png", ".webp"]);

async function main() {
  const arquivos = readdirSync(DIR).filter((f) => ORIGINAIS.has(extname(f).toLowerCase()));
  if (arquivos.length === 0) {
    console.log("Nenhuma foto (.jpg/.jpeg/.jfif/.png/.webp) encontrada em src/assets/cidades/.");
    return;
  }

  let totalAntes = 0;
  let totalDepois = 0;

  for (const arquivo of arquivos) {
    const origem = join(DIR, arquivo);
    const destino = join(DIR, basename(arquivo, extname(arquivo)) + ".webp");
    // Origem e destino podem ser o mesmo arquivo (reprocessar um .webp já
    // existente) — grava num temporário primeiro pra não ler e escrever o
    // mesmo arquivo ao mesmo tempo.
    const mesmoArquivo = origem === destino;
    const saida = mesmoArquivo ? destino + ".tmp" : destino;

    const bytesAntes = statSync(origem).size;
    totalAntes += bytesAntes;

    try {
      await sharp(origem)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(saida);
    } catch (err) {
      console.error(`Falhou em ${arquivo}:`, err.message);
      continue;
    }

    if (mesmoArquivo) {
      unlinkSync(origem);
      renameSync(saida, destino);
    } else {
      unlinkSync(origem);
    }

    const bytesDepois = statSync(destino).size;
    totalDepois += bytesDepois;

    const reducao = Math.round((1 - bytesDepois / bytesAntes) * 100);
    const sinal = reducao >= 0 ? "-" : "+";
    console.log(
      `${arquivo} → ${basename(destino)}  ` +
        `(${(bytesAntes / 1024).toFixed(0)}KB → ${(bytesDepois / 1024).toFixed(0)}KB, ${sinal}${Math.abs(reducao)}%)`,
    );
  }

  const reducaoTotal = Math.round((1 - totalDepois / totalAntes) * 100);
  const sinalTotal = reducaoTotal >= 0 ? "-" : "+";
  console.log(
    `\nTotal: ${(totalAntes / 1024 / 1024).toFixed(1)}MB → ${(totalDepois / 1024 / 1024).toFixed(1)}MB (${sinalTotal}${Math.abs(reducaoTotal)}%)`,
  );
}

main();
