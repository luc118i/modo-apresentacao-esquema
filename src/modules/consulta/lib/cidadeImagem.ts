import { foldAccents } from "@/shared/lib/normalize";

/**
 * Fotos opcionais em src/assets/cidades/ — o usuário só solta o arquivo lá
 * (ver LEIA-ME.md); nenhum código precisa mudar. `eager` resolve as URLs no
 * build, então o lookup abaixo é síncrono.
 */
const arquivos = import.meta.glob("/src/assets/cidades/*.{jpg,jpeg,jfif,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function slugify(value: string): string {
  return foldAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const porSlug = new Map<string, string>();
for (const [path, url] of Object.entries(arquivos)) {
  const nome = path.split("/").pop() ?? "";
  const slug = nome.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  porSlug.set(slug, url);
}

/** Busca uma foto real: primeiro "cidade-uf", depois só "uf" como fallback. */
export function fotoCidade(cidade: string, uf: string): string | null {
  const slugCidade = slugify(cidade);
  const slugUf = slugify(uf);
  return porSlug.get(`${slugCidade}-${slugUf}`) ?? porSlug.get(slugUf) ?? null;
}

/**
 * Gradiente + tom por UF quando não há foto — determinístico (mesma UF
 * sempre cai no mesmo par de cores), variado o bastante pra não ficar
 * repetitivo numa lista de 20 linhas.
 */
const GRADIENTES = [
  ["#7c2d12", "#c2410c"],
  ["#1e3a5f", "#2563eb"],
  ["#134e2f", "#16a34a"],
  ["#4c1d3d", "#a21caf"],
  ["#3f2a12", "#b45309"],
  ["#0f3a3a", "#0d9488"],
  ["#3b1d4d", "#7c3aed"],
  ["#4a1515", "#dc2626"],
] as const;

function hashStr(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

export function gradienteUf(uf: string): { from: string; to: string } {
  const idx = uf ? hashStr(uf) % GRADIENTES.length : 0;
  const [from, to] = GRADIENTES[idx];
  return { from, to };
}
