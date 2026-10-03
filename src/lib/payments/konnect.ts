import "server-only";

import type { CreatePaymentInput, CreatePaymentResult, PaymentProvider } from "./provider";

const SANDBOX_API = "https://api.sandbox.konnect.network/api/v2";
const PRODUCTION_API = "https://api.konnect.network/api/v2";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} est requis pour le provider Konnect.`);
  return value;
}

function apiBase(): string {
  const configured = process.env.KONNECT_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return process.env.KONNECT_ENV === "production" ? PRODUCTION_API : SANDBOX_API;
}

function toMinorUnits(amount: CreatePaymentInput["amount"]): number {
  const millimes = amount.mul(1000);
  if (!millimes.isInteger() || millimes.isNegative() || millimes.isZero()) {
    throw new Error("Le montant Konnect doit être un nombre positif de millimes.");
  }
  return millimes.toNumber();
}

async function konnectFetch(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(`${apiBase()}${path}`, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": required("KONNECT_API_KEY"),
        ...init?.headers,
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export const konnectPaymentProvider: PaymentProvider = {
  name: "konnect",
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const siteUrl = required("NEXTAUTH_URL").replace(/\/$/, "");
    if (process.env.NODE_ENV === "production" && !siteUrl.startsWith("https://")) {
      throw new Error("NEXTAUTH_URL doit utiliser HTTPS en production.");
    }

    const response = await konnectFetch("/payments/init-payment", {
      method: "POST",
      body: JSON.stringify({
        receiverWalletId: required("KONNECT_RECEIVER_WALLET_ID"),
        token: input.currency,
        amount: toMinorUnits(input.amount),
        type: "immediate",
        description: `Commande ${input.orderId} — ${input.phase === "ADVANCE" ? "acompte" : "solde"}`,
        acceptedPaymentMethods: ["bank_card", "e-DINAR", "wallet"],
        lifespan: Number(process.env.KONNECT_PAYMENT_LIFESPAN_MINUTES ?? 30),
        checkoutForm: true,
        addPaymentFeesToAmount: false,
        orderId: `${input.orderId}:${input.phase}`,
        webhook: `${siteUrl}/api/payments/webhook`,
        theme: "light",
      }),
    });

    const data = (await response.json().catch(() => null)) as { payUrl?: unknown; paymentRef?: unknown; message?: unknown } | null;
    if (!response.ok || typeof data?.payUrl !== "string" || typeof data.paymentRef !== "string") {
      throw new Error(`Konnect a refusé l'initialisation du paiement (${response.status}).`);
    }
    const checkout = new URL(data.payUrl);
    if (checkout.protocol !== "https:") throw new Error("Konnect a retourné une URL de paiement non sécurisée.");

    return {
      redirectUrl: checkout.toString(),
      providerRef: data.paymentRef,
      metadata: { environment: process.env.KONNECT_ENV === "production" ? "production" : "sandbox" },
    };
  },
};

export type KonnectVerdict = { state: "pending" } | { state: "completed" } | { state: "invalid"; reason: string };

/**
 * Compare la réponse serveur-à-serveur de Konnect au paiement enregistré chez nous. Source unique
 * de vérité pour le webhook ET pour la réconciliation d'un paiement resté en attente.
 */
export function judgeKonnectPayment(
  payment: { orderId: string; phase: string; currency: string; amount: { mul(value: number): { toNumber(): number } } },
  details: KonnectPaymentDetails,
): KonnectVerdict {
  if (details.status !== "completed") return { state: "pending" };
  const hasSuccessfulTransaction = details.transactions?.some((transaction) => transaction.status === "success") ?? true;
  if (!hasSuccessfulTransaction) return { state: "invalid", reason: "Transaction non confirmée." };
  if (details.token !== payment.currency) return { state: "invalid", reason: "Devise incohérente." };
  if (details.reachedAmount < payment.amount.mul(1000).toNumber()) return { state: "invalid", reason: "Montant insuffisant." };
  if (details.orderId !== `${payment.orderId}:${payment.phase}`) return { state: "invalid", reason: "Commande incohérente." };
  return { state: "completed" };
}

export interface KonnectPaymentDetails {
  id: string;
  status: string;
  reachedAmount: number;
  token: string;
  orderId: string;
  transactions?: Array<{ status?: string }>;
}

export async function getKonnectPaymentDetails(paymentRef: string): Promise<KonnectPaymentDetails> {
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(paymentRef)) throw new Error("Référence Konnect invalide.");
  const response = await konnectFetch(`/payments/${encodeURIComponent(paymentRef)}`);
  const data = (await response.json().catch(() => null)) as { payment?: Partial<KonnectPaymentDetails> } | null;
  const payment = data?.payment;
  if (!response.ok || !payment || typeof payment.id !== "string" || typeof payment.status !== "string") {
    throw new Error(`Impossible de vérifier le paiement Konnect (${response.status}).`);
  }
  if (typeof payment.reachedAmount !== "number" || typeof payment.token !== "string" || typeof payment.orderId !== "string") {
    throw new Error("Réponse Konnect incomplète.");
  }
  return payment as KonnectPaymentDetails;
}
