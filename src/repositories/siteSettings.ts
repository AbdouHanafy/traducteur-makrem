import { prisma } from "@/lib/prisma";
import { HEX_COLOR, THEME_SETTING_PREFIX, THEME_TOKENS } from "@/lib/theme";

/** Surcharges de couleurs enregistrées, indexées par clé de jeton (sans le préfixe `theme.`). */
export async function getThemeOverrides(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: THEME_SETTING_PREFIX } } });
  return Object.fromEntries(rows.map((row) => [row.key.slice(THEME_SETTING_PREFIX.length), row.value]));
}

/** Remplace l'ensemble des surcharges : une valeur absente ou égale au défaut est supprimée. */
export async function saveThemeOverrides(values: Record<string, string>) {
  const customized = THEME_TOKENS.flatMap((token) => {
    const value = values[token.key]?.toLowerCase();
    if (!value || !HEX_COLOR.test(value) || value === token.default.toLowerCase()) return [];
    return [{ key: `${THEME_SETTING_PREFIX}${token.key}`, value }];
  });

  await prisma.$transaction(async (tx) => {
    await tx.siteSetting.deleteMany({ where: { key: { startsWith: THEME_SETTING_PREFIX } } });
    if (customized.length > 0) await tx.siteSetting.createMany({ data: customized });
  });
}
