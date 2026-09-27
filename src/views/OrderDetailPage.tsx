"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LockedPreview from "@/views/components/LockedPreview";

const STATUS_LABELS: Record<string, string> = {
  DEMANDE: "Demande",
  DEVIS_A_VALIDER: "Devis à valider",
  EN_ATTENTE_ACOMPTE: "En attente d'acompte",
  ACOMPTE_PAYE: "Acompte payé",
  EN_TRADUCTION: "En traduction",
  TRADUCTION_TERMINEE: "Traduction terminée",
  FICHIER_EN_ATTENTE_DE_SOLDE: "En attente du solde",
  SOLDE_PAYE: "Solde payé",
  TELECHARGEABLE: "Téléchargeable",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

export interface OrderDetailData {
  id: string;
  reference: string;
  status: string;
  sourceLang: string;
  targetLang: string;
  pages: number;
  totalAmount: string;
  advanceAmount: string;
  balanceAmount: string;
  advancePaid: boolean;
  balancePaid: boolean;
  service: { name: string };
  documents: { id: string; kind: "SOURCE" | "TRANSLATED"; originalName: string }[];
  statusHistory: { status: string; createdAt: string }[];
}

export default function OrderDetailPage({ order }: { order: OrderDetailData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceDoc = order.documents.find((d) => d.kind === "SOURCE");
  const translatedDoc = order.documents.find((d) => d.kind === "TRANSLATED");

  async function acceptQuote() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${order.id}/accept-quote`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setError("Impossible d'accepter le devis.");
      return;
    }
    router.refresh();
  }

  async function pay(phase: "advance" | "balance") {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${order.id}/payment/${phase}`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setError("Impossible de lancer le paiement.");
      return;
    }
    const data = await res.json();
    router.push(data.redirectUrl);
  }

  return (
    <div className="mx-auto max-w-[820px] px-6 py-14">
      <div className="mb-8">
        <span className="mb-2 inline-flex items-center rounded-full bg-blue-soft px-3 py-1 text-[12.5px] font-semibold text-blue-2">
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
        <h1 className="font-serif text-[26px] text-navy">{order.reference}</h1>
        <p className="mt-1 text-[14px] text-muted">
          {order.service.name} · {order.sourceLang.toUpperCase()} → {order.targetLang.toUpperCase()} ·{" "}
          {order.pages} page{order.pages > 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-6">
          <section className="rounded-[14px] border border-line bg-white p-6">
            <h2 className="mb-4 text-[16.5px] text-navy">Document source</h2>
            {sourceDoc ? (
              <a
                href={`/api/orders/${order.id}/documents/${sourceDoc.id}/download`}
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-blue hover:text-blue-2"
              >
                Télécharger {sourceDoc.originalName}
              </a>
            ) : (
              <p className="text-[13.5px] text-muted">Aucun document.</p>
            )}
          </section>

          <section className="rounded-[14px] border border-line bg-white p-6">
            <h2 className="mb-4 text-[16.5px] text-navy">Traduction certifiée</h2>
            {!translatedDoc ? (
              <p className="text-[13.5px] text-muted">
                Le traducteur n&apos;a pas encore déposé le fichier final.
              </p>
            ) : order.balancePaid ? (
              <a
                href={`/api/orders/${order.id}/documents/${translatedDoc.id}/download`}
                className="inline-flex items-center gap-2 rounded-[11px] bg-ok px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:opacity-90"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
                </svg>
                Télécharger le fichier certifié
              </a>
            ) : (
              <LockedPreview orderId={order.id} documentId={translatedDoc.id} />
            )}
          </section>
        </div>

        <div className="grid gap-6">
          <section className="rounded-[14px] border border-line bg-white p-6">
            <h2 className="mb-4 text-[16.5px] text-navy">Paiement</h2>
            <dl className="grid gap-2.5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-muted">Total</dt>
                <dd className="font-semibold text-ink">{order.totalAmount} TND</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Acompte (50%)</dt>
                <dd className={order.advancePaid ? "text-ok font-semibold" : "font-semibold text-ink"}>
                  {order.advanceAmount} TND {order.advancePaid && "· payé"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Solde (50%)</dt>
                <dd className={order.balancePaid ? "text-ok font-semibold" : "font-semibold text-ink"}>
                  {order.balanceAmount} TND {order.balancePaid && "· payé"}
                </dd>
              </div>
            </dl>

            <div className="mt-5 grid gap-2.5">
              {order.status === "DEVIS_A_VALIDER" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={acceptQuote}
                  className="inline-flex items-center justify-center rounded-[11px] bg-blue px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:opacity-60"
                >
                  Accepter le devis
                </button>
              )}
              {order.status === "EN_ATTENTE_ACOMPTE" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => pay("advance")}
                  className="inline-flex items-center justify-center rounded-[11px] bg-blue px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:opacity-60"
                >
                  Payer l&apos;acompte ({order.advanceAmount} TND)
                </button>
              )}
              {order.status === "FICHIER_EN_ATTENTE_DE_SOLDE" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => pay("balance")}
                  className="inline-flex items-center justify-center rounded-[11px] bg-ok px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
                >
                  Payer le solde ({order.balanceAmount} TND)
                </button>
              )}
            </div>
          </section>

          <section className="rounded-[14px] border border-line bg-white p-6">
            <h2 className="mb-4 text-[16.5px] text-navy">Suivi</h2>
            <ol className="grid gap-3">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-[13.5px]">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                  <div>
                    <div className="font-medium text-ink">{STATUS_LABELS[h.status] ?? h.status}</div>
                    <div className="text-muted">{new Date(h.createdAt).toLocaleString("fr-FR")}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
