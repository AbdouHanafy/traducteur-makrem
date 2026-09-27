import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { serviceSchema } from "@/schemas/service";
import { createService, findServiceBySlug } from "@/repositories/services";

export async function POST(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existing = await findServiceBySlug(parsed.data.slug);
  if (existing) {
    return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
  }

  const service = await createService({
    ...parsed.data,
    pricePerPage: parsed.data.pricePerPage.toFixed(3),
    imageUrl: parsed.data.imageUrl || null,
  });

  return NextResponse.json({ service }, { status: 201 });
}
