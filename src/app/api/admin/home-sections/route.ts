import { NextResponse } from "next/server";
import { revalidateSite } from "@/lib/cache";
import { requireAdminSession } from "@/lib/rbac";
import { customSectionSchema } from "@/schemas/homeSection";
import { createCustomSection } from "@/repositories/homeSections";

export async function POST(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = customSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const section = await createCustomSection({
    eyebrow: parsed.data.eyebrow || null,
    title: parsed.data.title,
    body: parsed.data.body,
    imageUrl: parsed.data.imageUrl || null,
    ctaLabel: parsed.data.ctaLabel || null,
    ctaHref: parsed.data.ctaHref || null,
    translations: parsed.data.translations,
  });

  revalidateSite();
  return NextResponse.json({ section }, { status: 201 });
}
