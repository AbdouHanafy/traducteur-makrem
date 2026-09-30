import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/rbac";
import { revalidateSite } from "@/lib/cache";
import {
  CONTRAST_POLICIES,
  FONT_SLOTS,
  HEX_COLOR,
  LAYOUT_LIMITS,
  THEME_TOKENS,
  failingContrastPairs,
  isValidFontKey,
  type ContrastPolicy,
  type FontSlotKey,
} from "@/lib/theme";
import { getThemeSettings, saveThemeSettings } from "@/repositories/siteSettings";

const num = (limits: { min: number; max: number }) => z.number().min(limits.min).max(limits.max);
const themeSchema = z.object({
  values: z.record(z.string(), z.string().regex(HEX_COLOR, "Couleur hexadécimale invalide (#rrggbb).")),
  fonts: z.record(z.string(), z.string()).optional(),
  layout: z.object({ radius: num(LAYOUT_LIMITS.radius).optional(), width: num(LAYOUT_LIMITS.width).optional(), section: num(LAYOUT_LIMITS.section).optional() }).optional(),
  policy: z.enum(CONTRAST_POLICIES as [ContrastPolicy, ...ContrastPolicy[]]).optional(),
});
const KNOWN_KEYS = new Set(THEME_TOKENS.map((item) => item.key));

export async function PUT(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const parsed = themeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Valeur de thème invalide." }, { status: 400 });
  const data = parsed.data;
  if (Object.keys(data.values).some((key) => !KNOWN_KEYS.has(key))) {
    return NextResponse.json({ error: "Jeton de couleur inconnu." }, { status: 400 });
  }

  const current = await getThemeSettings();
  const fonts: Partial<Record<FontSlotKey, string>> = {};
  for (const [slot, key] of Object.entries(data.fonts ?? {})) {
    if (!(FONT_SLOTS as string[]).includes(slot) || !isValidFontKey(slot as FontSlotKey, key, current.customFonts)) {
      return NextResponse.json({ error: "Police inconnue.", code: "UNKNOWN_FONT" }, { status: 400 });
    }
    fonts[slot as FontSlotKey] = key;
  }

  // Politique de lisibilité : appliquée aussi côté serveur, pas seulement dans l'interface.
  const policy = data.policy ?? current.policy;
  const failing = failingContrastPairs(data.values, policy);
  if (failing.length > 0) {
    return NextResponse.json({ error: "Certaines couleurs sont illisibles.", code: "LOW_CONTRAST", pairs: failing }, { status: 422 });
  }

  await saveThemeSettings({ colors: data.values, fonts, layout: data.layout ?? {}, policy });
  revalidateSite();
  return NextResponse.json({ ok: true });
}
