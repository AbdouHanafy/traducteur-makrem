import "server-only";

import { renderClientPreview } from "@/lib/pdf-preview";
import {
  readClientPreviewMeta,
  readClientPreviewPage,
  readPrivateFile,
  writeClientPreview,
} from "@/lib/storage/privateStorage";

/**
 * Aperçu protégé du document traduit, montré au client AVANT le paiement du solde pour qu'il vérifie
 * que la traduction correspond à sa demande. Généré à la première consultation puis mis en cache
 * sur le disque privé ; le fichier réel, lui, reste verrouillé jusqu'à confirmation du solde.
 */
export async function ensureClientPreview(
  document: { storageKey: string; mimeType: string },
  reference: string,
): Promise<{ pageCount: number }> {
  const cached = await readClientPreviewMeta(document.storageKey);
  if (cached) return cached;
  const pages = await renderClientPreview(await readPrivateFile(document.storageKey), document.mimeType, reference);
  await writeClientPreview(document.storageKey, pages);
  return { pageCount: pages.length };
}

export { readClientPreviewPage };
