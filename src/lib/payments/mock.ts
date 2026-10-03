import "server-only";

import { randomUUID } from "node:crypto";
import type { CreatePaymentInput, CreatePaymentResult, PaymentProvider } from "./provider";

/**
 * Provider "mock" — dev/staging uniquement, jamais monté en prod (ARCHITECTURE.md §6.2).
 * Simule un vrai aller-retour serveur : `createPayment` ne fait que réserver une référence,
 * la confirmation passe par un vrai POST serveur (`/api/payments/mock/confirm`, voir cette
 * route) — jamais un simple `setTimeout` ou un `useState` côté navigateur.
 */
function mockRedirectUrl(providerRef: string, orderId: string, phase: string): string {
  return `/paiement/mock/${providerRef}?orderId=${orderId}&phase=${phase}`;
}

export const mockPaymentProvider: PaymentProvider = {
  name: "mock",
  async createPayment({ orderId, phase }: CreatePaymentInput): Promise<CreatePaymentResult> {
    const providerRef = `mock_${randomUUID()}`;
    return {
      providerRef,
      redirectUrl: mockRedirectUrl(providerRef, orderId, phase),
    };
  },
};
