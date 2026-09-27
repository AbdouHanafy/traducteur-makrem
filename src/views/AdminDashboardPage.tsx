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

const ACTION_NEEDED_STATUSES = new Set(["ACOMPTE_PAYE", "EN_TRADUCTION"]);

interface RecentOrder {
  id: string;
  reference: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  service: { name: string };
  user: { firstName: string; lastName: string; email: string };
}

interface DashboardStats {
  ordersToProcess: number;
  pendingQuotes: number;
  waitingOnClient: number;
  totalOrders: number;
  totalClients: number;
  newClientsThisWeek: number;
  revenueTotal: string;
  revenueThisMonth: string;
  recentOrders: RecentOrder[];
}

function formatAmount(value: string): string {
  return Number(value).toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

export default function AdminDashboardPage({ stats }: { stats: DashboardStats }) {
  const kpis = [
    {
      label: "Chiffre d'affaires encaissé",
      value: `${formatAmount(stats.revenueTotal)} TND`,
      sub: `dont ${formatAmount(stats.revenueThisMonth)} TND ce mois-ci`,
    },
    {
      label: "Commandes à traiter",
      value: String(stats.ordersToProcess),
      sub: "acompte payé ou en traduction",
      href: "/admin/orders",
    },
    {
      label: "Devis à valider",
      value: String(stats.pendingQuotes),
      sub: `${stats.waitingOnClient} en attente du client`,
      href: "/admin/orders",
    },
    {
      label: "Clients",
      value: String(stats.totalClients),
      sub: `+${stats.newClientsThisWeek} cette semaine`,
      href: "/admin/users",
    },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14">
      <h1 className="mb-6 text-[26px] text-navy">Tableau de bord</h1>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const content = (
            <>
              <div className="font-serif text-[24px] text-navy">{kpi.value}</div>
              <div className="mt-1 text-[12.5px] font-medium text-muted">{kpi.label}</div>
              <div className="mt-0.5 text-[11.5px] text-muted">{kpi.sub}</div>
            </>
          );
          return kpi.href ? (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="rounded-[12px] border border-line bg-white px-4 py-3.5 transition-colors hover:border-blue"
            >
              {content}
            </Link>
          ) : (
            <div key={kpi.label} className="rounded-[12px] border border-line bg-white px-4 py-3.5">
              {content}
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[17px] text-navy">Dernières commandes</h2>
        <Link href="/admin/orders" className="text-[13.5px] font-semibold text-blue hover:text-blue-2">
          Voir toutes les commandes
        </Link>
      </div>

      {stats.recentOrders.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-white p-10 text-center text-muted">
          Aucune commande pour l&apos;instant.
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[14px] border border-line bg-white md:block">
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
                {stats.recentOrders.map((order) => {
                  const needsAction = ACTION_NEEDED_STATUSES.has(order.status);
                  return (
                    <tr key={order.id} className="border-t border-line hover:bg-mist/50">
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
                      <td className="px-5 py-3.5 font-semibold text-ink">{order.totalAmount} TND</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {stats.recentOrders.map((order) => {
              const needsAction = ACTION_NEEDED_STATUSES.has(order.status);
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block rounded-[14px] border border-line bg-white p-4"
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
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
