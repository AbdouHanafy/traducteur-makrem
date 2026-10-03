import "server-only";

import type { Payment, Prisma } from "@prisma/client";
import { getPaymentProvider } from "@/lib/payments";
import { getKonnectPaymentDetails, judgeKonnectPayment } from "@/lib/payments/konnect";
import { confirmPaymentTransaction, createPaymentRecord, findPendingPayment, retirePayment } from "@/repositories/payments";

/** Le paiement de cette phase vient d'être confirmé par le prestataire (réconciliation). */
export class PaymentAlreadyConfirmedError extends Error {
  constructor() {
    super("Ce paiement est déjà confirmé.");
  }
}

/** Marge après la durée de vie de la session Konnect avant de considérer la tentative expirée. */
const EXPIRY_GRACE_MINUTES = 2;

function isExpired(payment: Payment): boolean {
  // La session de paiement du mock n'expire jamais ; celle de Konnect vit `lifespan` minutes.
  if (payment.provider !== "konnect") return false;
  const lifespan = Number(process.env.KONNECT_PAYMENT_LIFESPAN_MINUTES ?? 30);
  return Date.now() - payment.createdAt.getTime() > (lifespan + EXPIRY_GRACE_MINUTES) * 60_000;
}

/**
 * Une tentative expirée ne doit jamais bloquer la commande (le lien de paiement est mort), mais
 * avant de la retirer on demande au prestataire si le client n'a pas payé juste avant la fin :
 * dans ce cas on confirme le paiement au lieu d'en ouvrir un second.
 */
async function reconcileExpired(payment: Payment): Promise<void> {
  try {
    const details = await getKonnectPaymentDetails(payment.providerRef);
    if (judgeKonnectPayment(payment, details).state === "completed") {
      await confirmPaymentTransaction(payment.id, null, { acceptRetired: true });
      throw new PaymentAlreadyConfirmedError();
    }
  } catch (error) {
    if (error instanceof PaymentAlreadyConfirmedError) throw error;
    // Prestataire injoignable : on ne retire PAS la tentative (risque de double paiement).
    throw new Error("Impossible de vérifier votre paiement précédent pour le moment. Réessayez dans quelques minutes.");
  }
  await retirePayment(payment.id);
}

/**
 * Démarre (ou reprend) le paiement d'une phase : un paiement PENDING valide pour la même
 * commande/phase est réutilisé plutôt que d'en créer un nouveau à chaque clic.
 */
export async function startOrderPayment(
  order: { id: string; advanceAmount: Prisma.Decimal; balanceAmount: Prisma.Decimal },
  phase: "ADVANCE" | "BALANCE",
): Promise<{ redirectUrl: string }> {
  const provider = getPaymentProvider();

  const pending = await findPendingPayment(order.id, phase, provider.name);
  if (pending) {
    if (isExpired(pending)) {
      await reconcileExpired(pending);
    } else {
      if (!pending.checkoutUrl) throw new Error("URL du paiement en attente introuvable.");
      return { redirectUrl: pending.checkoutUrl };
    }
  }

  const amount = phase === "ADVANCE" ? order.advanceAmount : order.balanceAmount;
  const { redirectUrl, providerRef, metadata } = await provider.createPayment({ orderId: order.id, phase, amount, currency: "TND" });
  const payment = await createPaymentRecord({
    orderId: order.id,
    phase,
    amount,
    currency: "TND",
    provider: provider.name,
    providerRef,
    checkoutUrl: redirectUrl,
    metadata,
  });
  // Une requête concurrente peut avoir gagné la clé active après la création de la session
  // externe. Le repository renvoie alors le paiement gagnant, dont l'URL est la seule exposée.
  return { redirectUrl: payment.checkoutUrl ?? redirectUrl };
}
