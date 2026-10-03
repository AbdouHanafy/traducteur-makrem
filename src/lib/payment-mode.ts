/**
 * L'acompte (50 %) se règle sur place, en espèces, au cabinet : l'administrateur l'enregistre.
 * `ADVANCE_PAYMENT_MODE=online` réactive le paiement en ligne de l'acompte (tests, ou usage futur).
 * Le solde, lui, reste toujours payé en ligne.
 */
export function advanceIsInPerson(): boolean {
  return process.env.ADVANCE_PAYMENT_MODE !== "online";
}
