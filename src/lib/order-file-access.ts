import type { Prisma } from "@prisma/client";

export type TranslatedFileAccess = "NOT_READY" | "LOCKED" | "UNLOCKED";

interface FileAccessOrder {
  status: string;
  balancePaid: boolean;
  balanceAmount: Prisma.Decimal;
  payments: Array<{
    phase: string;
    status: string;
    amount: Prisma.Decimal;
    currency: string;
  }>;
  documents: Array<{
    kind: string;
    status: string;
  }>;
}

export function hasConfirmedBalanceProof(order: FileAccessOrder): boolean {
  return (
    order.balancePaid &&
    order.payments.some(
      (payment) =>
        payment.phase === "BALANCE" &&
        payment.status === "SUCCEEDED" &&
        payment.currency === "TND" &&
        payment.amount.equals(order.balanceAmount),
    )
  );
}

/** Même décision que la route de téléchargement : l'UI admin ne devine jamais le cadenas. */
export function getTranslatedFileAccess(order: FileAccessOrder): TranslatedFileAccess {
  const hasReadyTranslation = order.documents.some(
    (document) => document.kind === "TRANSLATED" && document.status === "READY",
  );
  if (!hasReadyTranslation) return "NOT_READY";

  const hasDownloadableStatus = order.status === "TELECHARGEABLE" || order.status === "TERMINEE";
  return hasDownloadableStatus && hasConfirmedBalanceProof(order) ? "UNLOCKED" : "LOCKED";
}
