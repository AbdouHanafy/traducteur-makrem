import { NextResponse } from "next/server";
import { requireOrderOwner } from "@/lib/rbac";
import { limit, MINUTE } from "@/lib/rate-limit";
import { startOrderPayment } from "@/lib/payments/start";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireOrderOwner(id);

  if ("error" in result) {
    const status = result.error === "unauthenticated" ? 401 : result.error === "forbidden" ? 403 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }

  const blocked = limit(request, "payment", { userId: result.session.user.id, perUser: [20, 10 * MINUTE] });
  if (blocked) return blocked;

  const { order } = result;

  if (order.status !== "FICHIER_EN_ATTENTE_DE_SOLDE" || order.balancePaid) {
    return NextResponse.json({ error: "Solde non exigible pour cette commande." }, { status: 409 });
  }

  return NextResponse.json(await startOrderPayment(order, "BALANCE"));
}
