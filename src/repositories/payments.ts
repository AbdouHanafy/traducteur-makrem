import "server-only";

import { prisma } from "@/lib/prisma";
import type { PaymentPhase, Prisma } from "@prisma/client";
import { enqueueEmail } from "@/lib/email/outbox";

export interface CreatePaymentRecordInput {
  orderId: string;
  phase: PaymentPhase;
  amount: Prisma.Decimal;
  currency: string;
  provider: string;
  providerRef: string;
  checkoutUrl: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export async function createPaymentRecord(data: CreatePaymentRecordInput) {
  const activeKey = `${data.orderId}:${data.phase}:${data.provider}`;
  try {
    return await prisma.payment.create({
      data: {
        orderId: data.orderId,
        phase: data.phase,
        amount: data.amount,
        currency: data.currency,
        provider: data.provider,
        providerRef: data.providerRef,
        checkoutUrl: data.checkoutUrl,
        activeKey,
        rawPayload: data.metadata,
        status: "PENDING",
      },
    });
  } catch (error) {
    const isUniqueConflict = typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
    if (!isUniqueConflict) throw error;
    const existing = await prisma.payment.findUnique({ where: { activeKey } });
    if (!existing || existing.status !== "PENDING") throw error;
    return existing;
  }
}

export function findPaymentByProviderRef(providerRef: string) {
  return prisma.payment.findUnique({ where: { providerRef } });
}

/**
 * Libère le verrou "un seul paiement actif par commande/phase" d'une tentative abandonnée ou
 * expirée, pour permettre d'en créer une nouvelle. La tentative reste confirmable a posteriori
 * (voir `acceptRetired`) : si le client a payé juste avant l'expiration, l'argent n'est pas perdu.
 */
export function retirePayment(paymentId: string) {
  return prisma.payment.updateMany({
    where: { id: paymentId, status: "PENDING" },
    data: { status: "FAILED", activeKey: null },
  });
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
export async function confirmPaymentTransaction(paymentId: string, actorId: string | null, options: { acceptRetired?: boolean } = {}) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
    const order = await tx.order.findUniqueOrThrow({ where: { id: payment.orderId } });

    if (payment.status === "SUCCEEDED") return { alreadyProcessed: true };
    const confirmable = payment.status === "PENDING" || (options.acceptRetired === true && payment.status === "FAILED");
    if (!confirmable) throw new Error("Ce paiement ne peut pas être confirmé.");
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
      where: { id: payment.id, status: { in: options.acceptRetired ? ["PENDING", "FAILED"] : ["PENDING"] } },
      data: { status: "SUCCEEDED", confirmedAt: new Date(), activeKey: null },
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

    const user = await tx.user.findUniqueOrThrow({ where: { id: order.userId }, select: { email: true, firstName: true } });
    const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
    await enqueueEmail(tx, {
      recipient: user.email,
      template: "PAYMENT_CONFIRMED",
      payload: {
        name: user.firstName,
        reference: order.reference,
        amount: payment.amount.toString(),
        phase: payment.phase === "ADVANCE" ? "acompte" : "solde",
        url: `${baseUrl}/dashboard/orders/${order.id}`,
      },
    });

    return { alreadyProcessed: false };
  });
}
