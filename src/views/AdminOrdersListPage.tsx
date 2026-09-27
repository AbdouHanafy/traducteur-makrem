"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TranslatedFileAccess } from "@/lib/order-file-access";
import FileAccessBadge from "@/views/components/FileAccessBadge";

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

/** Statuts où la balle est dans le camp du traducteur, pas du client — c'est ce qui doit
 * sauter aux yeux dans une liste d'ops, pas l'exhaustivité du statut brut. */
const ACTION_NEEDED_STATUSES = new Set(["ACOMPTE_PAYE", "EN_TRADUCTION"]);

interface AdminOrderRow {
  id: string;
  reference: string;
  status: string;
  fileAccess: TranslatedFileAccess;
  totalAmount: string;
  service: { name: string };
  user: { firstName: string; lastName: string; email: string };
}

const FILTERS = [
  { key: "action", label: "À traiter", match: (o: AdminOrderRow) => ACTION_NEEDED_STATUSES.has(o.status) },
  { key: "waiting", label: "En attente client", match: (o: AdminOrderRow) => ["EN_ATTENTE_ACOMPTE", "FICHIER_EN_ATTENTE_DE_SOLDE"].includes(o.status) },
  { key: "locked", label: "Fichiers verrouillés", match: (o: AdminOrderRow) => o.fileAccess === "LOCKED" },
  { key: "unlocked", label: "Fichiers ouverts", match: (o: AdminOrderRow) => o.fileAccess === "UNLOCKED" },
  { key: "done", label: "Terminées", match: (o: AdminOrderRow) => ["TELECHARGEABLE", "TERMINEE"].includes(o.status) },
  { key: "all", label: "Toutes", match: () => true },
] as const;

export default function AdminOrdersListPage({ orders }: { orders: AdminOrderRow[] }) {
  const [filterKey, setFilterKey] = useState<(typeof FILTERS)[number]["key"]>("action");

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.key, orders.filter((o) => f.match(o)).length])),
    [orders],
  );

  const activeFilter = FILTERS.find((f) => f.key === filterKey) ?? FILTERS[0];
  const filteredOrders = orders.filter((o) => activeFilter.match(o));

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mb-7">
        <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">Opérations</p>
        <h1 className="text-[27px] text-navy sm:text-[30px]">Commandes</h1>
        <p className="mt-2 text-[13.5px] text-muted">Priorisez les dossiers à traiter et suivez chaque livraison.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilterKey(f.key)}
            className={`rounded-2xl border px-5 py-4 text-left shadow-[0_6px_20px_rgba(20,40,77,0.035)] transition-all ${
              filterKey === f.key ? "border-blue bg-blue-soft ring-2 ring-blue/5" : "border-[#e4e9f1] bg-white hover:-translate-y-0.5 hover:border-blue/30"
            }`}
          >
            <div className={`text-[25px] font-semibold ${filterKey === f.key ? "text-blue-2" : "text-navy"}`}>
              {counts[f.key]}
            </div>
            <div className="text-[12.5px] font-medium text-muted">{f.label}</div>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-[#e4e9f1] bg-white p-12 text-center text-muted shadow-[0_8px_25px_rgba(20,40,77,0.04)]">
          Aucune commande dans ce filtre.
        </div>
      ) : (
        <>
          {/* Desktop : tableau. En dessous de md, une table réelle ne tient jamais dans un
              écran de téléphone (adresses email, libellés de statut...) — une liste de cartes
              est le vrai équivalent mobile, pas juste une table qu'on laisse déborder. */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#e4e9f1] bg-white shadow-[0_8px_25px_rgba(20,40,77,0.04)] md:block">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-[#f8f9fc] text-[10.5px] uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th className="px-5 py-3">Référence</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Accès fichier</th>
                  <th className="px-5 py-3">Montant</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const needsAction = ACTION_NEEDED_STATUSES.has(order.status);
                  return (
                    <tr key={order.id} className="border-t border-[#edf0f5] transition hover:bg-[#f8faff]">
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-2 font-semibold text-blue hover:text-blue-2">
                          {needsAction && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-seal" aria-hidden="true" />}
                          {order.reference}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-ink">
                        {order.user.firstName} {order.user.lastName}
                        <div className="text-[12px] text-muted">{order.user.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-ink">{order.service.name}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                            needsAction ? "bg-[#fdf1e2] text-[#9a5b12]" : "bg-blue-soft text-blue-2"
                          }`}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><FileAccessBadge access={order.fileAccess} /></td>
                      <td className="px-5 py-3.5 font-semibold text-ink">{order.totalAmount} TND</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile : cartes */}
          <div className="grid gap-3 md:hidden">
            {filteredOrders.map((order) => {
              const needsAction = ACTION_NEEDED_STATUSES.has(order.status);
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block rounded-2xl border border-[#e4e9f1] bg-white p-4 shadow-[0_6px_20px_rgba(20,40,77,0.04)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 font-semibold text-blue">
                      {needsAction && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-seal" aria-hidden="true" />}
                      {order.reference}
                    </div>
                    <span className="shrink-0 font-semibold text-ink">{order.totalAmount} TND</span>
                  </div>
                  <div className="mt-1.5 text-[13.5px] text-ink">
                    {order.user.firstName} {order.user.lastName}
                  </div>
                  <div className="truncate text-[12px] text-muted">{order.user.email}</div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[12.5px] text-muted">{order.service.name}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                        needsAction ? "bg-[#fdf1e2] text-[#9a5b12]" : "bg-blue-soft text-blue-2"
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <div className="mt-3 border-t border-[#edf0f5] pt-3">
                    <FileAccessBadge access={order.fileAccess} />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
