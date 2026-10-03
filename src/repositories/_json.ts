import "server-only";

import { Prisma } from "@prisma/client";
import { cleanTranslations, type TranslationsMap } from "@/lib/localize";

/**
 * Prépare le champ `translations` (JSON nullable) pour Prisma : nettoie les valeurs vides et
 * stocke un vrai NULL SQL quand plus aucune traduction n'existe.
 */
export function withTranslations<T extends { translations?: TranslationsMap | null }>(data: T) {
  // Champ absent = ne pas toucher aux traductions existantes.
  if (data.translations === undefined) return data as Omit<T, "translations">;
  const cleaned = cleanTranslations(data.translations);
  return {
    ...data,
    translations: cleaned ? (cleaned as Prisma.InputJsonObject) : Prisma.DbNull,
  };
}
