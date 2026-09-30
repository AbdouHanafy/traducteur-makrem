import { NextResponse } from "next/server";
import { revalidateSite } from "@/lib/cache";
import { requireAdminSession } from "@/lib/rbac";
import { deletePartner, findPartnerById, updatePartner } from "@/repositories/partners";
import { partnerSchema } from "@/schemas/partner";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  const { id } = await params;
  if (!await findPartnerById(id)) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = partnerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });

  const partner = await updatePartner(id, {
    ...parsed.data,
    logoUrl: parsed.data.logoUrl || null,
    websiteUrl: parsed.data.websiteUrl || null,
  });
  revalidateSite();
  return NextResponse.json({ partner });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  const { id } = await params;
  if (!await findPartnerById(id)) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  await deletePartner(id);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
