import { NextResponse } from "next/server";
import { revalidateSite } from "@/lib/cache";
import { requireAdminSession } from "@/lib/rbac";
import { SITE_CONTENT_KEY_SET } from "@/lib/site-content";
import { saveSiteContent } from "@/repositories/siteContent";
import { siteContentSchema } from "@/schemas/siteContent";

export async function PUT(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = siteContentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const entries = Object.entries(parsed.data.values);
  if (entries.length > SITE_CONTENT_KEY_SET.size || entries.some(([key]) => !SITE_CONTENT_KEY_SET.has(key))) {
    return NextResponse.json({ error: "Une clé de contenu n'est pas autorisée." }, { status: 400 });
  }

  await saveSiteContent(parsed.data.locale, parsed.data.values);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
