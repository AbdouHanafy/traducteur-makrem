import { NextResponse } from "next/server";
import { requireOrderOwner } from "@/lib/rbac";
import { startOrderPayment } from "@/lib/payments/start";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireOrderOwner(id);

  if ("error" in result) {
    const status = result.error === "unauthenticated" ? 401 : result.error === "forbidden" ? 403 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }

  const { order } = result;

  if (order.status !== "EN_ATTENTE_ACOMPTE" || order.advancePaid) {
    return NextResponse.json({ error: "Acompte non exigible pour cette commande." }, { status: 409 });
  }

  return NextResponse.json(await startOrderPayment(order, "ADVANCE"));
}
