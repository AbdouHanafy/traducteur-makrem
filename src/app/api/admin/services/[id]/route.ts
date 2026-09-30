import { NextResponse } from "next/server";
import { revalidateSite } from "@/lib/cache";
import { requireAdminSession } from "@/lib/rbac";
import { serviceSchema } from "@/schemas/service";
import { findServiceById, findServiceBySlug, updateService, deactivateService } from "@/repositories/services";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findServiceById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (parsed.data.slug !== existing.slug) {
    const slugTaken = await findServiceBySlug(parsed.data.slug);
    if (slugTaken) return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
  }

  const service = await updateService(id, {
    ...parsed.data,
    pricePerPage: parsed.data.pricePerPage.toFixed(3),
    imageUrl: parsed.data.imageUrl || null,
  });

  revalidateSite();
  return NextResponse.json({ service });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findServiceById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  await deactivateService(id);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
