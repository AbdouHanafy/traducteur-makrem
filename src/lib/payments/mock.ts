import { randomUUID } from "node:crypto";
import type { CreatePaymentInput, CreatePaymentResult, PaymentProvider } from "./provider";

/**
 * Provider "mock" — dev/staging uniquement, jamais monté en prod (ARCHITECTURE.md §6.2).
 * Simule un vrai aller-retour serveur : `createPayment` ne fait que réserver une référence,
 * la confirmation passe par un vrai POST serveur (`/api/payments/mock/confirm`, voir cette
 * route) — jamais un simple `setTimeout` ou un `useState` côté navigateur.
 */
export const mockPaymentProvider: PaymentProvider = {
  name: "mock",
  async createPayment({ orderId, phase }: CreatePaymentInput): Promise<CreatePaymentResult> {
    const providerRef = `mock_${randomUUID()}`;
    return {
      providerRef,
      redirectUrl: `/paiement/mock/${providerRef}?orderId=${orderId}&phase=${phase}`,
    };
  },
};

export function getPaymentProvider(): PaymentProvider {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Le provider de paiement mock est interdit en production. Configurez un provider réel.");
  }
  return mockPaymentProvider;
}
