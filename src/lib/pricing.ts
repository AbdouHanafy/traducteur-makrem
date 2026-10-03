import { Prisma } from "@prisma/client";

/**
 * Calcul de devis — auto, à partir des données DB (jamais de prix en dur, voir
 * ARCHITECTURE.md §1.2/§5). Montants en Decimal (millime tunisien, 3 décimales).
 */
export interface QuoteInput {
  pricePerPage: Prisma.Decimal;
  pages: number;
  delayMultiplier: Prisma.Decimal | null;
}

export interface Quote {
  totalAmount: Prisma.Decimal;
  advanceAmount: Prisma.Decimal;
  balanceAmount: Prisma.Decimal;
}

/** Répartition 50 % / 50 % d'un total (l'acompte est arrondi au millime, le solde absorbe le reste). */
export function splitQuote(total: Prisma.Decimal): Quote {
  const rounded = total.toDecimalPlaces(3);
  const advance = rounded.div(2).toDecimalPlaces(3);
  const balance = rounded.sub(advance);

  return { totalAmount: rounded, advanceAmount: advance, balanceAmount: balance };
}

export function computeQuote({ pricePerPage, pages, delayMultiplier }: QuoteInput): Quote {
  const base = pricePerPage.mul(pages);
  return splitQuote(delayMultiplier ? base.mul(delayMultiplier) : base);
}
