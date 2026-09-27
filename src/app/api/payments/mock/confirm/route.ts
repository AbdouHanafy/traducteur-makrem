import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findPaymentByProviderRef, confirmPaymentTransaction } from "@/repositories/payments";
import { findOrderById } from "@/repositories/orders";

/** Simulateur local uniquement. En production, seule la notification signée du provider réel
 * pourra confirmer un paiement. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" || process.env.PAYMENT_PROVIDER !== "mock") {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (typeof body?.providerRef !== "string") {
    return NextResponse.json({ error: "Référence de paiement requise." }, { status: 400 });
  }

  const payment = await findPaymentByProviderRef(body.providerRef);
  if (!payment || payment.provider !== "mock") {
    return NextResponse.json({ error: "Paiement introuvable." }, { status: 404 });
  }

  const order = await findOrderById(payment.orderId);
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const result = await confirmPaymentTransaction(payment.id, session.user.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Paiement non confirmé." }, { status: 409 });
  }
}
