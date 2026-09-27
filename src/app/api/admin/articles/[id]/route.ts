import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { articleSchema } from "@/schemas/article";
import { findArticleById, findArticleBySlug, updateArticle, deleteArticle } from "@/repositories/articles";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findArticleById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (parsed.data.slug !== existing.slug) {
    const slugTaken = await findArticleBySlug(parsed.data.slug);
    if (slugTaken) return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
  }

  const article = await updateArticle(id, { ...parsed.data, coverImageUrl: parsed.data.coverImageUrl || null });
  return NextResponse.json({ article });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findArticleById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  await deleteArticle(id);
  return NextResponse.json({ ok: true });
}
