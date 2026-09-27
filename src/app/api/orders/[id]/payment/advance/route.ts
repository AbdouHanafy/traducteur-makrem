import { NextResponse } from "next/server";
import { requireOrderOwner } from "@/lib/rbac";
import { getPaymentProvider } from "@/lib/payments/mock";
import { createPaymentRecord } from "@/repositories/payments";

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

  const provider = getPaymentProvider();
  const { redirectUrl, providerRef } = await provider.createPayment({
    orderId: order.id,
    phase: "ADVANCE",
    amount: order.advanceAmount,
    currency: "TND",
  });

  await createPaymentRecord({
    orderId: order.id,
    phase: "ADVANCE",
    amount: order.advanceAmount,
    currency: "TND",
    provider: provider.name,
    providerRef,
  });

  return NextResponse.json({ redirectUrl });
}
