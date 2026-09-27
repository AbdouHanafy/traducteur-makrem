"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface MockPaymentData {
  providerRef: string;
  orderId: string;
  orderReference: string;
  phase: "ADVANCE" | "BALANCE";
  amount: string;
}

/** Numéro de carte "refusée" — convention Stripe reprise telle quelle (largement connue des
 * devs), pour tester le chemin d'échec sans avoir à coder un vrai flag de test ad hoc. */
const DECLINED_TEST_CARD = "4000000000000002";

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function MockPaymentPage({ payment }: { payment: MockPaymentData }) {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardName, setCardName] = useState("Client Test");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [status, setStatus] = useState<"idle" | "processing" | "declined">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("processing");

    // Latence simulée — un vrai gateway fait un aller-retour réseau, ce simulateur en imite
    // le ressenti sans jamais faire croire que l'état est confirmé côté client.
    await new Promise((resolve) => setTimeout(resolve, 900));

    const digits = cardNumber.replace(/\s/g, "");
    if (digits === DECLINED_TEST_CARD) {
      setStatus("declined");
      setError("Paiement refusé par la banque (simulation — carte de test 4000 0000 0000 0002).");
      return;
    }

    const res = await fetch("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerRef: payment.providerRef }),
    });

    if (!res.ok) {
      setStatus("declined");
      setError("Le paiement n'a pas pu être confirmé.");
      return;
    }

    router.push(`/dashboard/orders/${payment.orderId}`);
    router.refresh();
  }

  const loading = status === "processing";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#0b1830_0%,#14284d_70%,#1a376b_100%)] px-4 py-10 sm:px-6">
      <div className="absolute -right-28 -top-36 h-96 w-96 rounded-full border-[70px] border-white/[0.035]" />
      <div className="relative w-full max-w-[460px] rounded-[22px] border border-white/20 bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.28)] sm:p-8">
        <Link href="/" className="mx-auto mb-6 flex w-fit items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-soft font-serif text-[13px] font-bold text-navy">MA</span><span className="font-serif text-[15px] font-semibold text-navy">Makram Arfaoui</span></Link>
        <div className="text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-soft px-3 py-1 text-[12.5px] font-semibold text-blue-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <path d="M3 10h18" />
            </svg>
            Bac à sable paiement — sandbox
          </span>
          <h1 className="text-[22px] text-navy">
            {payment.phase === "ADVANCE" ? "Paiement de l'acompte" : "Paiement du solde"}
          </h1>
          <p className="mt-2 text-[14px] text-muted">Commande {payment.orderReference}</p>
          <div className="my-6 rounded-xl border border-line bg-[#f7f9fc] py-5">
            <div className="text-[30px] font-semibold tracking-tight text-navy">{payment.amount} <small className="text-[12px]">TND</small></div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid gap-3.5">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink">Numéro de carte</label>
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              required
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] tracking-wide text-ink outline-none transition focus:border-blue focus:ring-3 focus:ring-blue/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink">Titulaire de la carte</label>
            <input
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Nom Prénom"
              required
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-blue focus:ring-3 focus:ring-blue/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink">Expiration</label>
              <input
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                inputMode="numeric"
                placeholder="MM/AA"
                required
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-blue focus:ring-3 focus:ring-blue/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink">CVC</label>
              <input
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="123"
                required
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-blue focus:ring-3 focus:ring-blue/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1.5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ok px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_9px_22px_rgba(30,158,106,0.22)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".25" />
                  <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Traitement en cours…
              </>
            ) : (
              `Payer ${payment.amount} TND`
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href={`/dashboard/orders/${payment.orderId}`} className="text-[13.5px] text-muted hover:text-navy">
            Annuler
          </Link>
        </div>

        <div className="mt-6 rounded-[10px] bg-mist px-4 py-3 text-[12px] leading-relaxed text-muted">
          <b className="text-ink">Environnement de test</b> — aucune banque réelle n&apos;est
          appelée ; un vrai provider (Konnect/Flouci) remplacera cet écran en production.
          <br />
          Carte <code className="text-ink">4242 4242 4242 4242</code> → paiement accepté ·{" "}
          <code className="text-ink">4000 0000 0000 0002</code> → paiement refusé (simulation).
        </div>
      </div>
    </div>
  );
}
