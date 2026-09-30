/**
 * Identité visuelle pilotable depuis le backoffice : couleurs, polices, mise en page. Les valeurs
 * par défaut sont celles de globals.css (identité « cabinet juridique premium ») ; la base ne
 * stocke que les surcharges.
 */
export type ThemeGroup = "brand" | "surfaces" | "text" | "states";

export interface ThemeToken {
  key: string;
  cssVar: string;
  group: ThemeGroup;
  default: string;
}

const token = (key: string, group: ThemeGroup, value: string): ThemeToken => ({ key, cssVar: `--color-${key}`, group, default: value });

export const THEME_TOKENS: ThemeToken[] = [
  token("navy", "brand", "#14284d"),
  token("navy-2", "brand", "#0c1a34"),
  token("blue", "brand", "#2456b8"),
  token("blue-2", "brand", "#1e4fa8"),
  token("blue-soft", "brand", "#e9effa"),
  token("seal", "brand", "#b4894e"),
  token("accent-light", "brand", "#8fb4ff"),
  token("accent-2", "brand", "#7967c8"),
  token("mist", "surfaces", "#edf0f5"),
  token("paper", "surfaces", "#ffffff"),
  token("surface", "surfaces", "#f7f9fc"),
  token("line", "surfaces", "#dce3ee"),
  token("edge", "surfaces", "#e4e9f1"),
  token("ink", "text", "#14203a"),
  token("muted", "text", "#5b6a83"),
  token("muted-light", "text", "#b4c4e0"),
  token("ok", "states", "#1e9e6a"),
  token("ok-soft", "states", "#e3f5ec"),
  token("ok-light", "states", "#7ce0b1"),
  token("warn", "states", "#c9822b"),
  token("caution", "states", "#9a5b12"),
  token("caution-soft", "states", "#fff3df"),
  token("caution-line", "states", "#f1d7ae"),
  token("danger", "states", "#9c2c2c"),
  token("danger-soft", "states", "#fdecec"),
  token("danger-line", "states", "#f3c6c6"),
];

export const THEME_GROUPS: ThemeGroup[] = ["brand", "surfaces", "text", "states"];

// Préfixes des clés SiteSetting (chaque famille est remplacée en bloc à l'enregistrement).
export const THEME_SETTING_PREFIX = "theme.";
export const FONT_SETTING_PREFIX = "font.";
export const LAYOUT_SETTING_PREFIX = "layout.";
export const POLICY_SETTING_KEY = "policy.contrast";
/** Polices personnalisées : préfixe distinct, géré par /api/admin/fonts (pas par l'enregistrement du thème). */
export const CUSTOM_FONT_PREFIX = "customfont.";

export const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// ---- Polices ----------------------------------------------------------------------------

export type FontKind = "serif" | "sans" | "arabic" | "custom";

export interface FontOption {
  key: string;
  label: string;
  cssVar: string;
  kind: FontKind;
}

const font = (key: string, label: string, kind: FontKind, cssVar = `--font-${key}`): FontOption => ({ key, label, cssVar, kind });

/** Polices latines (chargées via next/font, voir src/app/fonts.ts). */
export const LATIN_FONTS: FontOption[] = [
  font("spectral", "Spectral", "serif"),
  font("playfair", "Playfair Display", "serif"),
  font("lora", "Lora", "serif"),
  font("merriweather", "Merriweather", "serif"),
  font("libre-baskerville", "Libre Baskerville", "serif"),
  font("cormorant", "Cormorant Garamond", "serif"),
  font("eb-garamond", "EB Garamond", "serif"),
  font("crimson", "Crimson Pro", "serif"),
  font("bitter", "Bitter", "serif"),
  font("inter", "Inter", "sans"),
  font("poppins", "Poppins", "sans"),
  font("montserrat", "Montserrat", "sans"),
  font("roboto", "Roboto", "sans"),
  font("source-sans", "Source Sans 3", "sans"),
  font("dm-sans", "DM Sans", "sans"),
  font("open-sans", "Open Sans", "sans"),
  font("nunito", "Nunito", "sans"),
  font("raleway", "Raleway", "sans"),
];

/** Polices arabes ("system" = polices arabes du système, comportement d'origine). */
export const ARABIC_FONTS: FontOption[] = [
  font("system", "Système (Tahoma / Segoe UI)", "arabic", "--font-system-ar"),
  font("cairo", "Cairo", "arabic"),
  font("tajawal", "Tajawal", "arabic"),
  font("noto-naskh", "Noto Naskh Arabic", "arabic"),
  font("noto-kufi", "Noto Kufi Arabic", "arabic"),
  font("amiri", "Amiri", "arabic"),
  font("almarai", "Almarai", "arabic"),
  font("plex-arabic", "IBM Plex Sans Arabic", "arabic", "--font-plex-arabic"),
  font("readex", "Readex Pro", "arabic"),
  font("el-messiri", "El Messiri", "arabic"),
];

/** Emplacements de polices personnalisées (fichier .woff2 téléversé). */
export const CUSTOM_FONT_SLOTS = [1, 2] as const;
export type CustomFontSlot = (typeof CUSTOM_FONT_SLOTS)[number];
export const customFontKey = (slot: number) => `custom${slot}`;
export const customFontCssVar = (slot: number) => `--font-custom-${slot}`;
export const customFontFamily = (slot: number) => `SiteCustom${slot}`;
export const CUSTOM_FONT_URL = /^\/uploads\/fonts\/[a-f0-9-]{36}\.woff2$/;

export interface CustomFont {
  slot: CustomFontSlot;
  name: string;
  url: string;
}

export type FontSlotKey = "heading" | "body" | "headingAr" | "bodyAr";
export const FONT_SLOTS: FontSlotKey[] = ["heading", "body", "headingAr", "bodyAr"];
export const DEFAULT_FONTS: Record<FontSlotKey, string> = { heading: "spectral", body: "inter", headingAr: "system", bodyAr: "system" };

/** Options d'un emplacement : polices du catalogue + polices personnalisées téléversées. */
export function fontOptionsFor(slot: FontSlotKey, custom: CustomFont[]): FontOption[] {
  const base = slot === "headingAr" || slot === "bodyAr" ? ARABIC_FONTS : slot === "body" ? LATIN_FONTS.filter((f) => f.kind === "sans") : LATIN_FONTS;
  return [...base, ...custom.map((c) => font(customFontKey(c.slot), c.name, "custom", customFontCssVar(c.slot)))];
}

export function isValidFontKey(slot: FontSlotKey, key: string, custom: CustomFont[]): boolean {
  return fontOptionsFor(slot, custom).some((f) => f.key === key);
}

// ---- Mise en page -----------------------------------------------------------------------

export interface LayoutSettings {
  /** Échelle des rayons de coins (0 = angles droits, 1 = défaut, 2 = très arrondi). */
  radius: number;
  /** Largeur maximale du contenu public, en px. */
  width: number;
  /** Échelle de l'espacement vertical entre sections de la page publique. */
  section: number;
}

export const DEFAULT_LAYOUT: LayoutSettings = { radius: 1, width: 1200, section: 1 };
export const LAYOUT_LIMITS = {
  radius: { min: 0, max: 2, step: 0.1 },
  width: { min: 960, max: 1440, step: 20 },
  section: { min: 0.6, max: 1.6, step: 0.1 },
} as const;

export type ContrastPolicy = "off" | "block" | "strict";
export const CONTRAST_POLICIES: ContrastPolicy[] = ["off", "block", "strict"];
export const DEFAULT_POLICY: ContrastPolicy = "block";

export interface ThemeSettings {
  colors: Record<string, string>;
  fonts: Partial<Record<FontSlotKey, string>>;
  layout: Partial<LayoutSettings>;
  customFonts: CustomFont[];
  policy: ContrastPolicy;
}

export const EMPTY_THEME: ThemeSettings = { colors: {}, fonts: {}, layout: {}, customFonts: [], policy: DEFAULT_POLICY };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Convertit les surcharges enregistrées en variables CSS (valeurs strictement validées). */
export function themeToCssVars(settings: ThemeSettings): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const item of THEME_TOKENS) {
    const value = settings.colors[item.key];
    if (value && HEX_COLOR.test(value)) vars[item.cssVar] = value.toLowerCase();
  }

  for (const custom of settings.customFonts) {
    if (CUSTOM_FONT_URL.test(custom.url)) vars[customFontCssVar(custom.slot)] = `"${customFontFamily(custom.slot)}"`;
  }
  const targets: Record<FontSlotKey, string> = { heading: "--font-heading", body: "--font-body", headingAr: "--font-heading-ar", bodyAr: "--font-body-ar" };
  for (const slot of FONT_SLOTS) {
    const key = settings.fonts[slot];
    if (!key || key === DEFAULT_FONTS[slot]) continue;
    const option = fontOptionsFor(slot, settings.customFonts).find((f) => f.key === key);
    if (option) vars[targets[slot]] = `var(${option.cssVar})`;
  }

  const { radius, width, section } = settings.layout;
  if (typeof radius === "number") vars["--radius-scale"] = String(clamp(radius, LAYOUT_LIMITS.radius.min, LAYOUT_LIMITS.radius.max));
  if (typeof width === "number") vars["--site-width"] = `${Math.round(clamp(width, LAYOUT_LIMITS.width.min, LAYOUT_LIMITS.width.max))}px`;
  if (typeof section === "number") vars["--section-scale"] = String(clamp(section, LAYOUT_LIMITS.section.min, LAYOUT_LIMITS.section.max));
  return vars;
}

/** @font-face des polices téléversées (URL et noms validés strictement : aucune saisie libre). */
export function customFontFaceCss(customFonts: CustomFont[]): string {
  return customFonts
    .filter((c) => CUSTOM_FONT_URL.test(c.url))
    .map((c) => `@font-face{font-family:"${customFontFamily(c.slot)}";src:url("${c.url}") format("woff2");font-display:swap;font-weight:100 900}`)
    .join("");
}

/** Palettes prêtes à l'emploi : elles ne redéfinissent que les couleurs de marque et de fond. */
export interface ThemePreset {
  key: string;
  colors: Record<string, string>;
}

export const THEME_PRESETS: ThemePreset[] = [
  { key: "original", colors: {} },
  { key: "emerald", colors: { navy: "#0f3b34", "navy-2": "#08251f", blue: "#1a7f64", "blue-2": "#146650", "blue-soft": "#e4f4ee", mist: "#eef3f1", "accent-light": "#7fd6b5", "accent-2": "#3b8f7a" } },
  { key: "bordeaux", colors: { navy: "#4a1424", "navy-2": "#2f0b16", blue: "#9b2c4a", "blue-2": "#82233e", "blue-soft": "#f8e8ed", mist: "#f5eff0", seal: "#c19a5b", "accent-light": "#f0a3b8", "accent-2": "#b0506a" } },
  { key: "graphite", colors: { navy: "#1f2933", "navy-2": "#11181f", blue: "#3e5c76", "blue-2": "#314b62", "blue-soft": "#e6ecf1", mist: "#eef0f2", seal: "#a68a64", "accent-light": "#9fb8cf", "accent-2": "#6b7f94" } },
  { key: "ocean", colors: { navy: "#0b3a5b", "navy-2": "#06253c", blue: "#0e7bb5", "blue-2": "#0a6494", "blue-soft": "#e2f1f9", mist: "#edf3f7", seal: "#c39a53", "accent-light": "#8fd0f0", "accent-2": "#3d8fb8" } },
  { key: "royal", colors: { navy: "#2b1d4f", "navy-2": "#1a1033", blue: "#6a3fc4", "blue-2": "#5732a3", "blue-soft": "#efe9fb", mist: "#f1eff6", seal: "#c9a24d", "accent-light": "#c2a8f5", "accent-2": "#8f6fe0" } },
];

// ---- Lisibilité (WCAG) -------------------------------------------------------------------

function channel(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** Rapport de contraste WCAG entre deux couleurs `#rrggbb` (1 à 21). */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Paires texte/fond réellement utilisées par l'interface (`fg`/`bg` : clés de jeton ou `#fff`). */
export const CONTRAST_PAIRS: Array<{ id: string; fg: string; bg: string }> = [
  { id: "inkOnPaper", fg: "ink", bg: "paper" },
  { id: "inkOnMist", fg: "ink", bg: "mist" },
  { id: "mutedOnPaper", fg: "muted", bg: "paper" },
  { id: "mutedOnMist", fg: "muted", bg: "mist" },
  { id: "blueOnPaper", fg: "blue", bg: "paper" },
  { id: "whiteOnBlue", fg: "#ffffff", bg: "blue" },
  { id: "whiteOnNavy", fg: "#ffffff", bg: "navy" },
  { id: "blue2OnSoft", fg: "blue-2", bg: "blue-soft" },
  { id: "lightOnNavy", fg: "accent-light", bg: "navy" },
  { id: "mutedLightOnNavy", fg: "muted-light", bg: "navy-2" },
  { id: "whiteOnOk", fg: "#ffffff", bg: "ok" },
  { id: "okOnSoft", fg: "ok", bg: "ok-soft" },
  { id: "cautionOnSoft", fg: "caution", bg: "caution-soft" },
  { id: "dangerOnSoft", fg: "danger", bg: "danger-soft" },
];

/** Seuils de la politique : "block" refuse ce qui est difficile à lire (< 3), "strict" exige AA (4,5). */
export const POLICY_THRESHOLD: Record<ContrastPolicy, number> = { off: 0, block: 3, strict: 4.5 };

/** Renvoie les paires qui passent sous le seuil de la politique (couleurs = défauts + surcharges). */
export function failingContrastPairs(colors: Record<string, string>, policy: ContrastPolicy): string[] {
  const threshold = POLICY_THRESHOLD[policy];
  if (threshold === 0) return [];
  const values: Record<string, string> = Object.fromEntries(THEME_TOKENS.map((t) => [t.key, colors[t.key] && HEX_COLOR.test(colors[t.key]) ? colors[t.key] : t.default]));
  return CONTRAST_PAIRS.filter((pair) => {
    const fg = pair.fg.startsWith("#") ? pair.fg : values[pair.fg];
    const bg = pair.bg.startsWith("#") ? pair.bg : values[pair.bg];
    return contrastRatio(fg, bg) < threshold;
  }).map((pair) => pair.id);
}
