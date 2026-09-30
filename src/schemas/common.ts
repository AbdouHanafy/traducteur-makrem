import { z } from "zod";

/** URL affichable par le site : chemin interne (`/uploads/...`) ou http(s) — jamais `javascript:`. */
export const safeUrlField = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((value) => /^\/(?!\/|\\)/.test(value) || /^https?:\/\//i.test(value), "Utilisez un chemin interne (/...) ou une adresse http(s).")
    .optional()
    .or(z.literal(""));

/** Traductions optionnelles (ar/en/it) d'un contenu : chaque champ est une chaîne bornée. */
export const translationsField = (fields: readonly string[], max = 20000) => {
  const entry = z.object(Object.fromEntries(fields.map((field) => [field, z.string().max(max).optional()]))).partial();
  return z.object({ ar: entry.optional(), en: entry.optional(), it: entry.optional() }).optional();
};
