import type { Prisma } from "@prisma/client";

/**
 * Abstraction paiement (ARCHITECTURE.md §6.2). Le frontend ne fait jamais `paid = true` :
 * il demande un paiement au backend, qui appelle le provider ; seule une confirmation
 * server-to-server (webhook signé pour un provider réel, endpoint de confirmation dédié
 * pour le mock) fait passer `advancePaid`/`balancePaid` à `true`.
 */
export type PaymentPhaseValue = "ADVANCE" | "BALANCE";

export interface CreatePaymentInput {
  orderId: string;
  phase: PaymentPhaseValue;
  amount: Prisma.Decimal;
  currency: string;
}

export interface CreatePaymentResult {
  redirectUrl: string;
  providerRef: string;
}

export interface PaymentProvider {
  name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** URL de reprise d'un paiement déjà créé (évite d'empiler des paiements PENDING). */
  redirectUrlFor(providerRef: string, orderId: string, phase: PaymentPhaseValue): string;
}
