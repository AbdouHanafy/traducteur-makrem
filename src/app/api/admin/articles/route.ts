import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { articleSchema } from "@/schemas/article";
import { createArticle, findArticleBySlug } from "@/repositories/articles";

export async function POST(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existing = await findArticleBySlug(parsed.data.slug);
  if (existing) {
    return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
  }

  const article = await createArticle({ ...parsed.data, coverImageUrl: parsed.data.coverImageUrl || null });
  return NextResponse.json({ article }, { status: 201 });
}
