"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export interface AdminOrderDetailData {
  id: string;
  reference: string;
  status: string;
  pages: number;
  sourceLang: string;
  targetLang: string;
  totalAmount: string;
  advancePaid: boolean;
  balancePaid: boolean;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
  service: { name: string };
  documents: { id: string; kind: "SOURCE" | "TRANSLATED"; originalName: string }[];
}

export default function AdminOrderDetailPage({ order }: { order: AdminOrderDetailData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const sourceDoc = order.documents.find((d) => d.kind === "SOURCE");
  const translatedDoc = order.documents.find((d) => d.kind === "TRANSLATED");

  async function startTranslation() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${order.id}/status`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setError("Impossible de démarrer la traduction.");
      return;
    }
    router.refresh();
  }

  async function uploadTranslated(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Sélectionnez le fichier final.");
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const res = await fetch(`/api/admin/orders/${order.id}/document`, { method: "POST", body: formData });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Échec de l'envoi du fichier.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[820px] px-6 py-14">
      <span className="mb-2 inline-flex items-center rounded-full bg-blue-soft px-3 py-1 text-[12.5px] font-semibold text-blue-2">
        {STATUS_LABELS[order.status] ?? order.status}
      </span>
      <h1 className="font-serif text-[26px] text-navy">{order.reference}</h1>
      <p className="mt-1 text-[14px] text-muted">
        {order.service.name} · {order.sourceLang.toUpperCase()} → {order.targetLang.toUpperCase()} ·{" "}
        {order.pages} page{order.pages > 1 ? "s" : ""}
      </p>

      {error && (
        <div className="mt-6 rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
          {error}
        </div>
      )}

      <section className="mt-8 rounded-[14px] border border-line bg-white p-6">
        <h2 className="mb-3 text-[16.5px] text-navy">Client</h2>
        <p className="text-[14px] text-ink">
          {order.user.firstName} {order.user.lastName}
        </p>
        <p className="text-[13.5px] text-muted">{order.user.email}</p>
        {order.user.phone && <p className="text-[13.5px] text-muted">{order.user.phone}</p>}
      </section>

      <section className="mt-6 rounded-[14px] border border-line bg-white p-6">
        <h2 className="mb-3 text-[16.5px] text-navy">Document source</h2>
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

      <section className="mt-6 rounded-[14px] border border-line bg-white p-6">
        <h2 className="mb-3 text-[16.5px] text-navy">Traduction</h2>

        {order.status === "ACOMPTE_PAYE" && (
          <button
            type="button"
            disabled={loading}
            onClick={startTranslation}
            className="inline-flex items-center justify-center rounded-[11px] bg-blue px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:opacity-60"
          >
            Démarrer la traduction
          </button>
        )}

        {order.status === "EN_TRADUCTION" && !translatedDoc && (
          <form onSubmit={uploadTranslated} className="grid gap-3">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-[10px] border border-dashed border-line bg-mist px-4 py-3 text-[14px] text-ink outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-fit items-center justify-center rounded-[11px] bg-ok px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
            >
              Déposer le fichier final
            </button>
          </form>
        )}

        {translatedDoc && (
          <a
            href={`/api/orders/${order.id}/documents/${translatedDoc.id}/download`}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-blue hover:text-blue-2"
          >
            Revoir {translatedDoc.originalName}
          </a>
        )}

        {!["ACOMPTE_PAYE", "EN_TRADUCTION"].includes(order.status) && !translatedDoc && (
          <p className="text-[13.5px] text-muted">
            En attente du paiement de l&apos;acompte par le client.
          </p>
        )}
      </section>
    </div>
  );
}
