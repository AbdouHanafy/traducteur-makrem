import { NextResponse } from "next/server";
import { requireOrderOwner } from "@/lib/rbac";
import { limit, MINUTE } from "@/lib/rate-limit";
import { advanceIsInPerson } from "@/lib/payment-mode";
import { PaymentAlreadyConfirmedError, startOrderPayment } from "@/lib/payments/start";

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

  if (order.status !== "EN_ATTENTE_ACOMPTE" || order.advancePaid) {
    return NextResponse.json({ error: "Acompte non exigible pour cette commande." }, { status: 409 });
  }

  if (advanceIsInPerson()) {
    return NextResponse.json({ error: "L'acompte se règle sur place, en espèces.", code: "ADVANCE_IN_PERSON" }, { status: 409 });
  }

  try {
    return NextResponse.json(await startOrderPayment(order, "ADVANCE"));
  } catch (error) {
    if (error instanceof PaymentAlreadyConfirmedError) {
      return NextResponse.json({ error: error.message, code: "PAYMENT_ALREADY_CONFIRMED" }, { status: 409 });
    }
    console.error(JSON.stringify({ level: "error", event: "payment_start_failed", orderId: order.id, message: error instanceof Error ? error.message : "unknown" }));
    return NextResponse.json({ error: "Le paiement n'a pas pu être initialisé. Réessayez dans un instant.", code: "PAYMENT_UNAVAILABLE" }, { status: 502 });
  }
}
