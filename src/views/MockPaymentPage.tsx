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

export default function MockPaymentPage({ payment }: { payment: MockPaymentData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerRef: payment.providerRef }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Le paiement n'a pas pu être confirmé.");
      return;
    }
    router.push(`/dashboard/orders/${payment.orderId}`);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-6">
      <div className="w-full max-w-[440px] rounded-[16px] border border-line bg-white p-8 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-soft px-3 py-1 text-[12.5px] font-semibold text-blue-2">
          Simulateur de paiement (dev)
        </span>
        <h1 className="text-[22px] text-navy">
          {payment.phase === "ADVANCE" ? "Paiement de l'acompte" : "Paiement du solde"}
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Commande {payment.orderReference}
        </p>
        <div className="my-6 rounded-[12px] bg-mist py-5">
          <div className="font-serif text-[32px] text-navy">{payment.amount} TND</div>
        </div>

        {error && (
          <div className="mb-4 rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={confirm}
          className="inline-flex w-full items-center justify-center rounded-[11px] bg-ok px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Confirmation…" : "Confirmer le paiement"}
        </button>
        <Link
          href={`/dashboard/orders/${payment.orderId}`}
          className="mt-4 inline-block text-[13.5px] text-muted hover:text-navy"
        >
          Annuler
        </Link>
        <p className="mt-6 text-[11.5px] text-muted">
          Environnement de développement — aucune banque réelle n&apos;est appelée. Un vrai
          provider (Konnect/Flouci) remplacera cet écran en production.
        </p>
      </div>
    </div>
  );
}
