import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findPaymentByProviderRef, markPaymentSucceeded } from "@/repositories/payments";
import { findOrderById, confirmAdvancePayment, confirmBalancePayment } from "@/repositories/orders";

/**
 * Point de confirmation serveur unique (ARCHITECTURE.md §6.4) : c'est ici, et nulle part
 * ailleurs, que `advancePaid`/`balancePaid` passent à `true`. Un vrai provider (Phase 11)
 * vérifierait ici une signature de webhook (secret serveur) ; le provider `mock` n'a pas de
 * secret à vérifier, donc on exige à la place que l'appelant soit authentifié ET propriétaire
 * de la commande — un webhook réel n'a pas de session utilisateur, cette contrainte est
 * spécifique au mode mock et disparaîtra avec un vrai provider.
 */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
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

  const order = await findOrderById(payment.orderId);
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Idempotence (Cas 4 du §42) : un webhook déjà traité ne refait rien.
  if (payment.status === "SUCCEEDED") {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  // Revérifier le montant contre la DB, jamais contre un payload seul (Cas 5 du §42).
  const expectedAmount = payment.phase === "ADVANCE" ? order.advanceAmount : order.balanceAmount;
  if (!payment.amount.equals(expectedAmount)) {
    return NextResponse.json({ error: "Montant incohérent." }, { status: 400 });
  }

  await markPaymentSucceeded(payment.id);

  if (payment.phase === "ADVANCE") {
    await confirmAdvancePayment(order.id, session.user.id);
  } else {
    await confirmBalancePayment(order.id, session.user.id);
  }

  return NextResponse.json({ ok: true });
}
