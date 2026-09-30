import { prisma } from "@/lib/prisma";
import type { PaymentPhase, Prisma } from "@prisma/client";

export interface CreatePaymentRecordInput {
  orderId: string;
  phase: PaymentPhase;
  amount: Prisma.Decimal;
  currency: string;
  provider: string;
  providerRef: string;
}

export function createPaymentRecord(data: CreatePaymentRecordInput) {
  return prisma.payment.create({ data: { ...data, status: "PENDING" } });
}

export function findPaymentByProviderRef(providerRef: string) {
  return prisma.payment.findUnique({ where: { providerRef } });
}

export function findPendingPayment(orderId: string, phase: PaymentPhase, provider: string) {
  return prisma.payment.findFirst({
    where: { orderId, phase, provider, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export function findSucceededBalancePayment(orderId: string, amount: Prisma.Decimal) {
  return prisma.payment.findFirst({
    where: {
      orderId,
      phase: "BALANCE",
      status: "SUCCEEDED",
      amount,
      currency: "TND",
    },
    select: { id: true },
  });
}

/**
 * Confirme un paiement et fait avancer la commande dans une seule transaction. Aucune route
 * ne doit positionner `advancePaid`/`balancePaid` séparément : si une étape échoue, tout est
 * annulé afin d'éviter un fichier déverrouillé sans paiement confirmé correspondant.
 */
export async function confirmPaymentTransaction(paymentId: string, actorId: string | null) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
    const order = await tx.order.findUniqueOrThrow({ where: { id: payment.orderId } });

    if (payment.status === "SUCCEEDED") return { alreadyProcessed: true };
    if (payment.status !== "PENDING") throw new Error("Ce paiement ne peut pas être confirmé.");
    if (payment.currency !== "TND") throw new Error("Devise de paiement incohérente.");

    const expectedAmount = payment.phase === "ADVANCE" ? order.advanceAmount : order.balanceAmount;
    if (!payment.amount.equals(expectedAmount)) throw new Error("Montant de paiement incohérent.");

    if (payment.phase === "ADVANCE") {
      if (order.status !== "EN_ATTENTE_ACOMPTE" || order.advancePaid) {
        throw new Error("Acompte non exigible pour cette commande.");
      }
    } else {
      if (order.status !== "FICHIER_EN_ATTENTE_DE_SOLDE" || order.balancePaid) {
        throw new Error("Solde non exigible pour cette commande.");
      }
    }

    // Une seule requête concurrente peut revendiquer ce paiement. Les suivantes deviennent
    // des no-op idempotents et ne peuvent donc pas doubler les transitions ou l'audit.
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "SUCCEEDED", confirmedAt: new Date() },
    });
    if (claimed.count !== 1) return { alreadyProcessed: true };

    if (payment.phase === "ADVANCE") {
      await tx.order.update({ where: { id: order.id }, data: { advancePaid: true, status: "ACOMPTE_PAYE" } });
      await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "ACOMPTE_PAYE", actorId, note: "Acompte confirmé" } });
    } else {
      await tx.order.update({ where: { id: order.id }, data: { balancePaid: true, status: "SOLDE_PAYE" } });
      await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "SOLDE_PAYE", actorId, note: "Solde confirmé" } });
      await tx.order.update({ where: { id: order.id }, data: { status: "TELECHARGEABLE" } });
      await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "TELECHARGEABLE", note: "Fichier débloqué" } });
    }

    await tx.auditLog.create({
      data: {
        actorId,
        action: "PAYMENT_CONFIRMED",
        resource: `payment:${payment.id}`,
        metadata: { orderId: order.id, phase: payment.phase, amount: payment.amount.toString(), currency: payment.currency },
      },
    });

    return { alreadyProcessed: false };
  });
}
