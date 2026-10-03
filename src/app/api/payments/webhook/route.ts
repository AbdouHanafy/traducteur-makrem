import { NextResponse } from "next/server";
import { limit, MINUTE } from "@/lib/rate-limit";
import { findPaymentByProviderRef, confirmPaymentTransaction } from "@/repositories/payments";
import { getKonnectPaymentDetails, judgeKonnectPayment } from "@/lib/payments/konnect";

/**
 * Point de confirmation serveur unique (ARCHITECTURE.md §6.4) : c'est ici, et nulle part
 * ailleurs, que `advancePaid`/`balancePaid` passent à `true`. Cette route refuse le provider
 * mock et exige un secret serveur. L'intégration du provider réel remplacera ce contrôle
 * générique par la vérification cryptographique de sa signature native.
 */
export async function GET(request: Request) {
  const blocked = limit(request, "webhook", { perIp: [300, MINUTE] });
  if (blocked) return blocked;

  if (process.env.PAYMENT_PROVIDER !== "konnect") {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }
  const providerRef = new URL(request.url).searchParams.get("payment_ref");
  if (!providerRef) return NextResponse.json({ error: "payment_ref requis." }, { status: 400 });

  const payment = await findPaymentByProviderRef(providerRef);
  if (!payment) {
    return NextResponse.json({ error: "Paiement introuvable." }, { status: 404 });
  }
  if (payment.provider !== "konnect") {
    return NextResponse.json({ error: "Paiement introuvable." }, { status: 404 });
  }

  try {
    // Konnect envoie seulement payment_ref. L'authenticité et le statut sont vérifiés par
    // lecture server-to-server avec la clé API, conformément à leur documentation officielle.
    const details = await getKonnectPaymentDetails(providerRef);
    const verdict = judgeKonnectPayment(payment, details);
    if (verdict.state === "pending") return NextResponse.json({ ok: true, pending: true }, { status: 202 });
    if (verdict.state === "invalid") return NextResponse.json({ error: verdict.reason }, { status: 409 });
    // acceptRetired : un paiement terminé juste avant l'expiration reste valable.
    const result = await confirmPaymentTransaction(payment.id, null, { acceptRetired: true });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Paiement non confirmé." }, { status: 409 });
  }
}

/** Ancien webhook générique explicitement désactivé pour éviter une confirmation par secret partagé. */
export async function POST() {
  return NextResponse.json({ error: "Méthode non prise en charge." }, { status: 405, headers: { Allow: "GET" } });
}
