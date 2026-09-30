import type { Prisma } from "@prisma/client";
import { getPaymentProvider } from "@/lib/payments/mock";
import { createPaymentRecord, findPendingPayment } from "@/repositories/payments";

/**
 * Démarre (ou reprend) le paiement d'une phase : un paiement PENDING existant pour la même
 * commande/phase est réutilisé plutôt que d'en créer un nouveau à chaque clic.
 */
export async function startOrderPayment(
  order: { id: string; advanceAmount: Prisma.Decimal; balanceAmount: Prisma.Decimal },
  phase: "ADVANCE" | "BALANCE",
): Promise<{ redirectUrl: string }> {
  const provider = getPaymentProvider();

  const pending = await findPendingPayment(order.id, phase, provider.name);
  if (pending) {
    return { redirectUrl: provider.redirectUrlFor(pending.providerRef, order.id, phase) };
  }

  const amount = phase === "ADVANCE" ? order.advanceAmount : order.balanceAmount;
  const { redirectUrl, providerRef } = await provider.createPayment({ orderId: order.id, phase, amount, currency: "TND" });
  await createPaymentRecord({ orderId: order.id, phase, amount, currency: "TND", provider: provider.name, providerRef });
  return { redirectUrl };
}
