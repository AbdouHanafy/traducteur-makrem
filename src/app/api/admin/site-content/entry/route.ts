import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/rbac";
import { revalidateSite } from "@/lib/cache";
import { LOCALES } from "@/lib/i18n";
import { SITE_CONTENT_KEY_SET } from "@/lib/site-content";
import { saveSiteContentEntry } from "@/repositories/siteContent";

const entrySchema = z.object({
  locale: z.enum(LOCALES),
  key: z.string().min(1).max(191),
  // null = rétablir le texte d'origine
  value: z.string().max(10000).nullable(),
});

/** Enregistre ou rétablit un seul texte du site, sans toucher aux autres. */
export async function PATCH(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const parsed = entrySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  if (!SITE_CONTENT_KEY_SET.has(parsed.data.key)) {
    return NextResponse.json({ error: "Ce texte n'est pas modifiable.", code: "KEY_NOT_EDITABLE" }, { status: 400 });
  }

  const saved = await saveSiteContentEntry(parsed.data.locale, parsed.data.key, parsed.data.value);
  revalidateSite();
  return NextResponse.json({ ok: true, ...saved });
}
