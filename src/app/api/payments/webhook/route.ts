import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { limit, MINUTE } from "@/lib/rate-limit";
import { findPaymentByProviderRef, confirmPaymentTransaction } from "@/repositories/payments";

/**
 * Point de confirmation serveur unique (ARCHITECTURE.md §6.4) : c'est ici, et nulle part
 * ailleurs, que `advancePaid`/`balancePaid` passent à `true`. Cette route refuse le provider
 * mock et exige un secret serveur. L'intégration du provider réel remplacera ce contrôle
 * générique par la vérification cryptographique de sa signature native.
 */
export async function POST(request: Request) {
  const blocked = limit(request, "webhook", { perIp: [300, MINUTE] });
  if (blocked) return blocked;

  if (process.env.PAYMENT_PROVIDER === "mock") {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  const configuredSecret = process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET;
  const receivedSecret = request.headers.get("x-payment-webhook-secret");
  if (!configuredSecret || !receivedSecret) {
    return NextResponse.json({ error: "Signature requise." }, { status: 401 });
  }
  const expected = Buffer.from(configuredSecret);
  const received = Buffer.from(receivedSecret);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const providerRef = body?.providerRef;
  if (typeof providerRef !== "string") {
    return NextResponse.json({ error: "providerRef requis." }, { status: 400 });
  }

  const payment = await findPaymentByProviderRef(providerRef);
  if (!payment) {
    return NextResponse.json({ error: "Paiement introuvable." }, { status: 404 });
  }
  if (payment.provider !== process.env.PAYMENT_PROVIDER) {
    return NextResponse.json({ error: "Paiement introuvable." }, { status: 404 });
  }

  try {
    const result = await confirmPaymentTransaction(payment.id, null);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Paiement non confirmé." }, { status: 409 });
  }
}
