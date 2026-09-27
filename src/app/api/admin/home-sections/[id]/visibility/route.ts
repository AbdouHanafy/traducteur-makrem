import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { toggleHomeSectionVisibility } from "@/repositories/homeSections";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (typeof body?.visible !== "boolean") {
    return NextResponse.json({ error: "visible (boolean) requis." }, { status: 400 });
  }

  await toggleHomeSectionVisibility(id, body.visible);
  return NextResponse.json({ ok: true });
}
