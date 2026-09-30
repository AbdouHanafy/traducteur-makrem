import { randomUUID } from "node:crypto";
import path from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";

/**
 * Stockage privé des documents — HORS `public/` (ARCHITECTURE.md §5). `storageKey` est un nom
 * aléatoire (UUID), jamais dérivé d'un input utilisateur : le nom original du fichier n'est
 * conservé qu'en DB pour affichage, jamais utilisé comme chemin.
 */
function getStorageRoot(): string {
  const root = process.env.PRIVATE_STORAGE_ROOT;
  if (!root) throw new Error("PRIVATE_STORAGE_ROOT n'est pas défini (voir .env.example).");
  return root;
}

function resolveSafePath(storageKey: string): string {
  const STORAGE_ROOT = getStorageRoot();
  // storageKey n'est jamais un input utilisateur brut (voir writeFile ci-dessous), mais on
  // refuse tout de même toute tentative de path traversal par défense en profondeur.
  if (storageKey.includes("..") || path.isAbsolute(storageKey)) {
    throw new Error("Clé de stockage invalide.");
  }
  const resolved = path.resolve(STORAGE_ROOT, storageKey);
  if (!resolved.startsWith(path.resolve(STORAGE_ROOT) + path.sep)) {
    throw new Error("Clé de stockage invalide.");
  }
  return resolved;
}

export async function writePrivateFile(buffer: Buffer, extension: string): Promise<string> {
  const storageKey = `${randomUUID()}${extension}`;
  const fullPath = resolveSafePath(storageKey);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, buffer);
  return storageKey;
}

/** Nettoyage d'un fichier écrit dont l'enregistrement en base a échoué (best effort). */
export async function deletePrivateFile(storageKey: string): Promise<void> {
  await unlink(resolveSafePath(storageKey)).catch(() => {});
}

export async function readPrivateFile(storageKey: string): Promise<Buffer> {
  return readFile(resolveSafePath(storageKey));
}

/** Dérive une clé de stockage pour une image d'aperçu, sans jamais toucher au fichier réel. */
export function previewStorageKey(storageKey: string, pageNumber: number): string {
  return `${storageKey}.preview.p${pageNumber}.jpg`;
}

export async function writePrivatePreview(
  sourceStorageKey: string,
  pageNumber: number,
  buffer: Buffer,
): Promise<string> {
  const key = previewStorageKey(sourceStorageKey, pageNumber);
  const fullPath = resolveSafePath(key);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, buffer);
  return key;
}

function previewMetaKey(storageKey: string): string {
  return `${storageKey}.preview.meta.json`;
}

export async function writePreviewMeta(storageKey: string, pageCount: number): Promise<void> {
  const fullPath = resolveSafePath(previewMetaKey(storageKey));
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, JSON.stringify({ pageCount }));
}

export async function readPreviewMeta(storageKey: string): Promise<{ pageCount: number } | null> {
  try {
    const raw = await readFile(resolveSafePath(previewMetaKey(storageKey)), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
