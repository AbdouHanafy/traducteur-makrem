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

const ACTION_NEEDED_STATUSES = new Set(["ACOMPTE_PAYE", "EN_TRADUCTION"]);

interface RecentOrder {
  id: string;
  reference: string;
  status: string;
  fileAccess: TranslatedFileAccess;
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
    { label: "Chiffre d'affaires encaissé", value: `${formatAmount(stats.revenueTotal)} TND`, sub: `${formatAmount(stats.revenueThisMonth)} TND ce mois-ci`, color: "bg-ok" },
    { label: "Commandes à traiter", value: String(stats.ordersToProcess), sub: "acompte payé ou en traduction", href: "/admin/orders", color: "bg-seal" },
    { label: "Devis à valider", value: String(stats.pendingQuotes), sub: `${stats.waitingOnClient} en attente du client`, href: "/admin/orders", color: "bg-blue" },
    { label: "Clients", value: String(stats.totalClients), sub: `+${stats.newClientsThisWeek} cette semaine`, href: "/admin/users", color: "bg-[#7967c8]" },
  ];

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">Pilotage du cabinet</p>
          <h1 className="text-[27px] text-navy sm:text-[30px]">Vue d&apos;ensemble</h1>
          <p className="mt-2 text-[13.5px] text-muted">Les priorités opérationnelles et l’activité récente du cabinet.</p>
        </div>
        <Link href="/admin/orders" className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_22px_rgba(20,40,77,0.18)] transition hover:bg-navy-2">Gérer les commandes <span aria-hidden="true">→</span></Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const content = <><div className="mb-5 flex items-center justify-between"><span className={`h-2.5 w-2.5 rounded-full ${kpi.color}`} />{kpi.href && <span className="text-[15px] text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue">→</span>}</div><div className="text-[25px] font-semibold tracking-tight text-navy">{kpi.value}</div><div className="mt-1.5 text-[12.5px] font-semibold text-ink">{kpi.label}</div><div className="mt-0.5 text-[11.5px] text-muted">{kpi.sub}</div></>;
          return kpi.href ? <Link key={kpi.label} href={kpi.href} className="group rounded-2xl border border-[#e4e9f1] bg-white p-5 shadow-[0_8px_25px_rgba(20,40,77,0.04)] transition hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-[0_14px_35px_rgba(20,40,77,0.08)]">{content}</Link> : <div key={kpi.label} className="rounded-2xl border border-[#e4e9f1] bg-white p-5 shadow-[0_8px_25px_rgba(20,40,77,0.04)]">{content}</div>;
        })}
      </div>

      <div className="mb-4 flex items-end justify-between gap-4">
        <div><h2 className="text-[18px] text-navy">Dernières commandes</h2><p className="mt-1 text-[12px] text-muted">Les demandes les plus récemment reçues</p></div>
        <Link href="/admin/orders" className="shrink-0 text-[12.5px] font-semibold text-blue hover:text-blue-2">Voir toutes <span aria-hidden="true">→</span></Link>
      </div>

      {stats.recentOrders.length === 0 ? (
        <div className="rounded-2xl border border-[#e4e9f1] bg-white p-12 text-center text-muted shadow-[0_8px_25px_rgba(20,40,77,0.04)]">Aucune commande pour l&apos;instant.</div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-[#e4e9f1] bg-white shadow-[0_8px_25px_rgba(20,40,77,0.04)] md:block">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f8f9fc] text-[10.5px] uppercase tracking-[0.1em] text-muted"><tr><th className="px-5 py-3.5">Référence</th><th className="px-5 py-3.5">Client</th><th className="px-5 py-3.5">Service</th><th className="px-5 py-3.5">Statut</th><th className="px-5 py-3.5">Accès fichier</th><th className="px-5 py-3.5 text-right">Montant</th></tr></thead>
              <tbody>
                {stats.recentOrders.map((order) => {
                  const needsAction = ACTION_NEEDED_STATUSES.has(order.status);
                  return <tr key={order.id} className="border-t border-[#edf0f5] transition hover:bg-[#f8faff]">
                    <td className="px-5 py-4"><Link href={`/admin/orders/${order.id}`} className="flex items-center gap-2 font-semibold text-blue hover:text-blue-2">{needsAction && <span className="h-2 w-2 shrink-0 rounded-full bg-seal" />}{order.reference}</Link></td>
                    <td className="px-5 py-4 text-ink"><span className="font-medium">{order.user.firstName} {order.user.lastName}</span><div className="text-[11.5px] text-muted">{order.user.email}</div></td>
                    <td className="px-5 py-4 text-ink">{order.service.name}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${needsAction ? "bg-[#fff3df] text-[#9a5b12]" : "bg-blue-soft text-blue-2"}`}>{STATUS_LABELS[order.status] ?? order.status}</span></td>
                    <td className="px-5 py-4"><FileAccessBadge access={order.fileAccess} /></td>
                    <td className="px-5 py-4 text-right font-semibold text-ink">{order.totalAmount} TND</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {stats.recentOrders.map((order) => {
              const needsAction = ACTION_NEEDED_STATUSES.has(order.status);
              return <Link key={order.id} href={`/admin/orders/${order.id}`} className="block rounded-2xl border border-[#e4e9f1] bg-white p-4 shadow-[0_6px_20px_rgba(20,40,77,0.04)]"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2 font-semibold text-blue">{needsAction && <span className="h-2 w-2 rounded-full bg-seal" />}{order.reference}</div><span className="shrink-0 font-semibold text-ink">{order.totalAmount} TND</span></div><div className="mt-2 text-[13px] font-medium text-ink">{order.user.firstName} {order.user.lastName}</div><div className="text-[11.5px] text-muted">{order.service.name}</div><div className="mt-3 flex flex-wrap items-center gap-2"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${needsAction ? "bg-[#fff3df] text-[#9a5b12]" : "bg-blue-soft text-blue-2"}`}>{STATUS_LABELS[order.status] ?? order.status}</span><FileAccessBadge access={order.fileAccess} /></div></Link>;
            })}
          </div>
        </>
      )}
    </div>
  );
}
