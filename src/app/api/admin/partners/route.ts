import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { createPartner } from "@/repositories/partners";
import { partnerSchema } from "@/schemas/partner";

export async function POST(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });

  const body = await request.json().catch(() => null);
  const parsed = partnerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });

  const partner = await createPartner({
    ...parsed.data,
    logoUrl: parsed.data.logoUrl || null,
    websiteUrl: parsed.data.websiteUrl || null,
  });
  return NextResponse.json({ partner }, { status: 201 });
}
