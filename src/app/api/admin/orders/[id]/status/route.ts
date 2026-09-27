import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/rbac";
import { startTranslation } from "@/repositories/orders";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireStaffSession();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  try {
    await startTranslation(id, result.session.user.id);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
