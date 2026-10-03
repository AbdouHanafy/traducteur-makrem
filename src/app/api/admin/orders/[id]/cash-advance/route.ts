import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { limit, HOUR } from "@/lib/rate-limit";
import { recordCashAdvance } from "@/repositories/payments";

/** L'administrateur confirme avoir encaissé l'acompte en espèces au cabinet. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }
  const blocked = limit(request, "admin-cash", { userId: result.session.user.id, perUser: [120, HOUR] });
  if (blocked) return blocked;

  try {
    await recordCashAdvance(id, result.session.user.id);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur.", code: "CASH_NOT_ALLOWED" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
