import Link from "next/link";
import LogoutButton from "@/views/components/LogoutButton";

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

interface OrderRow {
  id: string;
  reference: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  service: { name: string };
}

export default function OrdersListPage({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="mx-auto max-w-[960px] px-6 py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[22px] text-navy sm:text-[26px]">Mes commandes</h1>
        <div className="flex items-center gap-5">
          <Link
            href="/commander"
            className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2"
          >
            Nouvelle commande
          </Link>
          <LogoutButton />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-white p-10 text-center text-muted">
          Aucune commande pour l&apos;instant.
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="grid grid-cols-1 gap-3 rounded-[14px] border border-line bg-white px-6 py-5 transition hover:border-blue sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4"
            >
              <div className="min-w-0">
                <div className="font-serif text-[17px] text-navy">{order.reference}</div>
                <div className="mt-1 truncate text-[13.5px] text-muted">{order.service.name}</div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                <span className="inline-flex items-center rounded-full bg-blue-soft px-3 py-1 text-[12.5px] font-semibold text-blue-2">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
                <div className="text-[13px] text-muted sm:mt-1.5">{order.totalAmount} TND</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
