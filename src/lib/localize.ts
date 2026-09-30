import type { Locale } from "@/lib/i18n";

/** Langues saisissables en plus du français, qui reste la langue de base des colonnes. */
export const TRANSLATION_LOCALES = ["ar", "en", "it"] as const satisfies readonly Locale[];
export type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

export type TranslationsMap = Partial<Record<TranslationLocale, Partial<Record<string, string>>>>;

/** Champs traduisibles de chaque type de contenu (le français vit dans les colonnes de base). */
export const TRANSLATABLE_FIELDS = {
  service: ["name", "description"],
  article: ["title", "excerpt", "body"],
  faq: ["question", "answer"],
  testimonial: ["quote", "authorRole"],
  homeSection: ["eyebrow", "title", "body", "ctaLabel"],
} as const;

function readTranslations(value: unknown): TranslationsMap {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as TranslationsMap) : {};
}

/**
 * Renvoie l'élément avec ses champs remplacés par la traduction de la langue demandée.
 * Un champ non traduit (vide) retombe sur le français : jamais de trou dans la page.
 */
export function localize<T extends { translations?: unknown }>(item: T, locale: Locale, fields: readonly string[]): T {
  if (locale === "fr") return item;
  const entry = readTranslations(item.translations)[locale as TranslationLocale];
  if (!entry) return item;
  const overrides: Record<string, string> = {};
  for (const field of fields) {
    const value = entry[field];
    if (typeof value === "string" && value.trim()) overrides[field] = value;
  }
  return { ...item, ...overrides };
}

/** Retire les valeurs vides ; `null` si plus rien à stocker. */
export function cleanTranslations(input: TranslationsMap | undefined | null): TranslationsMap | null {
  if (!input) return null;
  const result: TranslationsMap = {};
  for (const locale of TRANSLATION_LOCALES) {
    const entry = input[locale];
    if (!entry) continue;
    const cleaned = Object.fromEntries(Object.entries(entry).filter(([, v]) => typeof v === "string" && v.trim()));
    if (Object.keys(cleaned).length > 0) result[locale] = cleaned as Record<string, string>;
  }
  return Object.keys(result).length > 0 ? result : null;
}

/** Lecture typée pour les formulaires d'administration. */
export function readTranslationsMap(value: unknown): TranslationsMap {
  return readTranslations(value);
}
