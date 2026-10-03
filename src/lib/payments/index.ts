import "server-only";

import type { PaymentProvider } from "./provider";
import { konnectPaymentProvider } from "./konnect";
import { mockPaymentProvider } from "./mock";

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? "mock";
  if (provider === "konnect") return konnectPaymentProvider;
  if (provider === "mock" && process.env.NODE_ENV !== "production") return mockPaymentProvider;
  throw new Error(`Provider de paiement non configuré ou interdit: ${provider}`);
}
