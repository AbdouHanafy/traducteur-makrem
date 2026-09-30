import { randomUUID } from "node:crypto";
import path from "node:path";
import { mkdir, unlink, writeFile } from "node:fs/promises";

/**
 * Stockage public — contenu du site (photos de services, médiathèque backoffice), à
 * distinguer explicitement du stockage privé des documents client (lib/storage/privateStorage.ts,
 * voir ARCHITECTURE.md §5). Ici, être servi publiquement est le but, pas un risque : on écrit
 * directement dans `public/uploads/media/`, comme calmatrip le fait pour ses images produit.
 */
const MEDIA_DIR = path.join(process.cwd(), "public", "uploads", "media");
const PUBLIC_URL_PREFIX = "/uploads/media";

export async function writePublicMedia(buffer: Buffer, extension: string): Promise<string> {
  const filename = `${randomUUID()}${extension}`;
  await mkdir(MEDIA_DIR, { recursive: true });
  await writeFile(path.join(MEDIA_DIR, filename), buffer);
  return `${PUBLIC_URL_PREFIX}/${filename}`;
}

export async function deletePublicMedia(url: string): Promise<void> {
  if (!url.startsWith(`${PUBLIC_URL_PREFIX}/`)) return;
  const filename = url.slice(`${PUBLIC_URL_PREFIX}/`.length);
  if (filename.includes("..") || filename.includes("/")) return;
  await unlink(path.join(MEDIA_DIR, filename)).catch(() => {});
}

const FONT_DIR = path.join(process.cwd(), "public", "uploads", "fonts");
const FONT_URL_PREFIX = "/uploads/fonts";

/** Écrit une police .woff2 (nom = UUID : jamais dérivé du nom de fichier envoyé). */
export async function writePublicFont(buffer: Buffer): Promise<string> {
  const filename = `${randomUUID()}.woff2`;
  await mkdir(FONT_DIR, { recursive: true });
  await writeFile(path.join(FONT_DIR, filename), buffer);
  return `${FONT_URL_PREFIX}/${filename}`;
}

export async function deletePublicFont(url: string): Promise<void> {
  if (!/^\/uploads\/fonts\/[a-f0-9-]{36}\.woff2$/.test(url)) return;
  await unlink(path.join(FONT_DIR, url.slice(FONT_URL_PREFIX.length + 1))).catch(() => {});
}
