import Link from "next/link";

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

interface AdminOrderRow {
  id: string;
  reference: string;
  status: string;
  totalAmount: string;
  service: { name: string };
  user: { firstName: string; lastName: string; email: string };
}

export default function AdminOrdersListPage({ orders }: { orders: AdminOrderRow[] }) {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14">
      <h1 className="mb-8 text-[26px] text-navy">Commandes</h1>

      {orders.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-white p-10 text-center text-muted">
          Aucune commande.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-line bg-white">
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-mist text-[12px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3">Référence</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Montant</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-line hover:bg-mist/50">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders/${order.id}`} className="font-semibold text-blue hover:text-blue-2">
                      {order.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-ink">
                    {order.user.firstName} {order.user.lastName}
                    <div className="text-[12px] text-muted">{order.user.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-ink">{order.service.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-blue-soft px-2.5 py-1 text-[11.5px] font-semibold text-blue-2">
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-ink">{order.totalAmount} TND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
