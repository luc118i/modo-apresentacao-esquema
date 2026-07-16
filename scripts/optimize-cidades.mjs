/**
 * Otimiza as fotos de cidade (src/assets/cidades/) depois que você terminar
 * de baixar/soltar as originais na pasta:
 *
 *   node scripts/optimize-cidades.mjs
 *
 * O card mostra a foto numa metade pequena (~320px de largura mesmo em tela
 * grande), então não precisa da foto original em alta resolução. Pra cada
 * .jpg/.jpeg/.jfif/.png encontrado: redimensiona (só encolhe, nunca aumenta) pra no
 * máximo 960px de largura — suficiente pra tela retina — e converte pra
 * .webp com qualidade 78 (bom equilíbrio tamanho/nitidez pra foto de cidade).
 * O arquivo original é substituído pelo .webp (mesmo nome); se já existir um
 * .webp com esse nome, o script não sobrescreve — apague manualmente se quiser
 * reprocessar.
 */
import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DIR = fileURLToPath(new URL("../src/assets/cidades", import.meta.url));
const MAX_WIDTH = 960;
const QUALITY = 78;
const ORIGINAIS = new Set([".jpg", ".jpeg", ".jfif", ".png"]);

async function main() {
  const arquivos = readdirSync(DIR).filter((f) => ORIGINAIS.has(extname(f).toLowerCase()));
  if (arquivos.length === 0) {
    console.log("Nenhuma foto original (.jpg/.jpeg/.png) encontrada em src/assets/cidades/.");
    return;
  }

  let totalAntes = 0;
  let totalDepois = 0;

  for (const arquivo of arquivos) {
    const origem = join(DIR, arquivo);
    const destino = join(DIR, basename(arquivo, extname(arquivo)) + ".webp");

    const bytesAntes = statSync(origem).size;
    totalAntes += bytesAntes;

    try {
      await sharp(origem)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(destino);
    } catch (err) {
      console.error(`Falhou em ${arquivo}:`, err.message);
      continue;
    }

    const bytesDepois = statSync(destino).size;
    totalDepois += bytesDepois;
    unlinkSync(origem);

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
