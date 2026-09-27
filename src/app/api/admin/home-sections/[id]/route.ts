import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { customSectionSchema } from "@/schemas/homeSection";
import { findHomeSectionById, updateCustomSection, deleteCustomSection } from "@/repositories/homeSections";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findHomeSectionById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  if (existing.type !== "CUSTOM") {
    return NextResponse.json({ error: "Seule une section personnalisée est éditable." }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parsed = customSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const section = await updateCustomSection(id, {
    eyebrow: parsed.data.eyebrow || null,
    title: parsed.data.title,
    body: parsed.data.body,
    imageUrl: parsed.data.imageUrl || null,
    ctaLabel: parsed.data.ctaLabel || null,
    ctaHref: parsed.data.ctaHref || null,
  });

  return NextResponse.json({ section });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  try {
    await deleteCustomSection(id);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
