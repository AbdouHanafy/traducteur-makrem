import { prisma } from "@/lib/prisma";
import { DICTIONARIES, LOCALES, type Locale } from "@/lib/i18n";
import { SITE_CONTENT_KEYS, SITE_CONTENT_KEY_SET } from "@/lib/site-content";

export async function getSiteContentOverrides(locale: Locale): Promise<Record<string, string>> {
  const entries = await prisma.siteContent.findMany({ where: { locale } });
  return Object.fromEntries(entries.map((entry) => [entry.key, entry.value]));
}

export async function getAllSiteContentOverrides(): Promise<Record<Locale, Record<string, string>>> {
  const entries = await prisma.siteContent.findMany({ orderBy: [{ locale: "asc" }, { key: "asc" }] });
  const result = Object.fromEntries(LOCALES.map((locale) => [locale, {}])) as Record<Locale, Record<string, string>>;
  for (const entry of entries) {
    if (LOCALES.includes(entry.locale as Locale) && SITE_CONTENT_KEY_SET.has(entry.key)) {
      result[entry.locale as Locale][entry.key] = entry.value;
    }
  }
  return result;
}

export async function saveSiteContent(locale: Locale, values: Record<string, string>) {
  const customized = SITE_CONTENT_KEYS.flatMap((key) => {
    const value = values[key];
    if (typeof value !== "string" || value === (DICTIONARIES[locale][key] ?? DICTIONARIES.fr[key] ?? key)) return [];
    return [{ key, locale, value }];
  });

  await prisma.$transaction(async (tx) => {
    await tx.siteContent.deleteMany({ where: { locale, key: { in: SITE_CONTENT_KEYS } } });
    if (customized.length > 0) await tx.siteContent.createMany({ data: customized });
  });
}

/**
 * Modifie UN seul texte (éditeur visuel). `null` ou une valeur identique au texte d'origine
 * supprime la personnalisation : le texte redevient celui du dictionnaire.
 */
export async function saveSiteContentEntry(locale: Locale, key: string, value: string | null) {
  const original = DICTIONARIES[locale][key] ?? DICTIONARIES.fr[key] ?? key;
  if (value === null || value === original) {
    await prisma.siteContent.deleteMany({ where: { locale, key } });
    return { customized: false, value: original };
  }
  await prisma.siteContent.upsert({
    where: { key_locale: { key, locale } },
    create: { key, locale, value },
    update: { value },
  });
  return { customized: true, value };
}
