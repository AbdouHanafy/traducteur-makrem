import { prisma } from "@/lib/prisma";
import {
  CONTRAST_POLICIES,
  CUSTOM_FONT_PREFIX,
  CUSTOM_FONT_SLOTS,
  CUSTOM_FONT_URL,
  DEFAULT_FONTS,
  DEFAULT_LAYOUT,
  DEFAULT_POLICY,
  FONT_SETTING_PREFIX,
  FONT_SLOTS,
  HEX_COLOR,
  LAYOUT_SETTING_PREFIX,
  POLICY_SETTING_KEY,
  THEME_SETTING_PREFIX,
  THEME_TOKENS,
  type ContrastPolicy,
  type CustomFont,
  type CustomFontSlot,
  type FontSlotKey,
  type LayoutSettings,
  type ThemeSettings,
} from "@/lib/theme";

const THEME_FAMILIES = [THEME_SETTING_PREFIX, FONT_SETTING_PREFIX, LAYOUT_SETTING_PREFIX];
const themeWhere = { OR: [...THEME_FAMILIES.map((prefix) => ({ key: { startsWith: prefix } })), { key: POLICY_SETTING_KEY }] };

/** Thème enregistré : couleurs, polices (4 emplacements), mise en page, polices téléversées, politique. */
export async function getThemeSettings(): Promise<ThemeSettings> {
  const rows = await prisma.siteSetting.findMany({
    where: { OR: [...themeWhere.OR, { key: { startsWith: CUSTOM_FONT_PREFIX } }] },
  });
  const settings: ThemeSettings = { colors: {}, fonts: {}, layout: {}, customFonts: [], policy: DEFAULT_POLICY };
  const custom: Record<number, { name?: string; url?: string }> = {};

  for (const row of rows) {
    if (row.key.startsWith(THEME_SETTING_PREFIX)) {
      settings.colors[row.key.slice(THEME_SETTING_PREFIX.length)] = row.value;
    } else if (row.key.startsWith(FONT_SETTING_PREFIX)) {
      const slot = row.key.slice(FONT_SETTING_PREFIX.length) as FontSlotKey;
      if (FONT_SLOTS.includes(slot)) settings.fonts[slot] = row.value;
    } else if (row.key.startsWith(LAYOUT_SETTING_PREFIX)) {
      const name = row.key.slice(LAYOUT_SETTING_PREFIX.length) as keyof LayoutSettings;
      const value = Number(row.value);
      if (name in DEFAULT_LAYOUT && Number.isFinite(value)) settings.layout[name] = value;
    } else if (row.key === POLICY_SETTING_KEY) {
      if ((CONTRAST_POLICIES as string[]).includes(row.value)) settings.policy = row.value as ContrastPolicy;
    } else if (row.key.startsWith(CUSTOM_FONT_PREFIX)) {
      const [, slotText, field] = row.key.split(".");
      const slot = Number(slotText);
      if ((CUSTOM_FONT_SLOTS as readonly number[]).includes(slot) && (field === "name" || field === "url")) {
        custom[slot] = { ...custom[slot], [field]: row.value };
      }
    }
  }

  for (const slot of CUSTOM_FONT_SLOTS) {
    const entry = custom[slot];
    if (entry?.name && entry.url && CUSTOM_FONT_URL.test(entry.url)) settings.customFonts.push({ slot, name: entry.name, url: entry.url });
  }
  return settings;
}

export interface ThemeInput {
  colors: Record<string, string>;
  fonts: Partial<Record<FontSlotKey, string>>;
  layout: Partial<LayoutSettings>;
  policy: ContrastPolicy;
}

/** Remplace tout le thème : une valeur absente ou égale au défaut n'est pas stockée. */
export async function saveThemeSettings(input: ThemeInput) {
  const rows: Array<{ key: string; value: string }> = [];

  for (const item of THEME_TOKENS) {
    const value = input.colors[item.key]?.toLowerCase();
    if (value && HEX_COLOR.test(value) && value !== item.default.toLowerCase()) rows.push({ key: `${THEME_SETTING_PREFIX}${item.key}`, value });
  }
  for (const slot of FONT_SLOTS) {
    const value = input.fonts[slot];
    if (value && value !== DEFAULT_FONTS[slot]) rows.push({ key: `${FONT_SETTING_PREFIX}${slot}`, value });
  }
  for (const name of Object.keys(DEFAULT_LAYOUT) as Array<keyof LayoutSettings>) {
    const value = input.layout[name];
    if (typeof value === "number" && value !== DEFAULT_LAYOUT[name]) rows.push({ key: `${LAYOUT_SETTING_PREFIX}${name}`, value: String(value) });
  }
  if (input.policy !== DEFAULT_POLICY) rows.push({ key: POLICY_SETTING_KEY, value: input.policy });

  await prisma.$transaction(async (tx) => {
    await tx.siteSetting.deleteMany({ where: themeWhere });
    if (rows.length > 0) await tx.siteSetting.createMany({ data: rows });
  });
}

/** Enregistre (ou remplace) une police téléversée ; renvoie l'ancienne URL pour suppression du fichier. */
export async function saveCustomFont(font: CustomFont): Promise<string | null> {
  const nameKey = `${CUSTOM_FONT_PREFIX}${font.slot}.name`;
  const urlKey = `${CUSTOM_FONT_PREFIX}${font.slot}.url`;
  const previous = await prisma.siteSetting.findUnique({ where: { key: urlKey } });
  await prisma.$transaction([
    prisma.siteSetting.upsert({ where: { key: nameKey }, create: { key: nameKey, value: font.name }, update: { value: font.name } }),
    prisma.siteSetting.upsert({ where: { key: urlKey }, create: { key: urlKey, value: font.url }, update: { value: font.url } }),
  ]);
  return previous?.value ?? null;
}

/** Supprime une police téléversée et libère les emplacements de police qui l'utilisaient. */
export async function removeCustomFont(slot: CustomFontSlot): Promise<string | null> {
  const urlKey = `${CUSTOM_FONT_PREFIX}${slot}.url`;
  const previous = await prisma.siteSetting.findUnique({ where: { key: urlKey } });
  await prisma.$transaction([
    prisma.siteSetting.deleteMany({ where: { key: { startsWith: `${CUSTOM_FONT_PREFIX}${slot}.` } } }),
    prisma.siteSetting.deleteMany({ where: { key: { startsWith: FONT_SETTING_PREFIX }, value: `custom${slot}` } }),
  ]);
  return previous?.value ?? null;
}
