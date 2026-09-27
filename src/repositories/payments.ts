import { prisma } from "@/lib/prisma";
import type { Prisma, PaymentPhase } from "@prisma/client";

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

export function markPaymentSucceeded(id: string) {
  return prisma.payment.update({
    where: { id },
    data: { status: "SUCCEEDED", confirmedAt: new Date() },
  });
}
