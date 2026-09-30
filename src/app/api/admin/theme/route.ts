import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/rbac";
import { revalidateSite } from "@/lib/cache";
import { HEX_COLOR, THEME_TOKENS } from "@/lib/theme";
import { saveThemeOverrides } from "@/repositories/siteSettings";

const themeSchema = z.object({ values: z.record(z.string(), z.string().regex(HEX_COLOR, "Couleur hexadécimale invalide (#rrggbb).")) });
const KNOWN_KEYS = new Set(THEME_TOKENS.map((token) => token.key));

export async function PUT(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const parsed = themeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Couleur invalide." }, { status: 400 });
  if (Object.keys(parsed.data.values).some((key) => !KNOWN_KEYS.has(key))) {
    return NextResponse.json({ error: "Jeton de couleur inconnu." }, { status: 400 });
  }

  await saveThemeOverrides(parsed.data.values);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
