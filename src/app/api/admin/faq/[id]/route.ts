import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { faqSchema } from "@/schemas/faq";
import { findFaqById, updateFaq, deleteFaq } from "@/repositories/faq";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findFaqById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const faq = await updateFaq(id, parsed.data);
  return NextResponse.json({ faq });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findFaqById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  await deleteFaq(id);
  return NextResponse.json({ ok: true });
}
