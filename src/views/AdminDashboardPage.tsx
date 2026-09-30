"use client";

import Link from "next/link";
import type { TranslatedFileAccess } from "@/lib/order-file-access";
import FileAccessBadge from "@/views/components/FileAccessBadge";
import { getDateLocale } from "@/lib/i18n";
import { useI18n } from "@/views/components/I18nProvider";

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

function formatAmount(value: string, dateLocale: string): string {
  return Number(value).toLocaleString(dateLocale, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

export default function AdminDashboardPage({ stats }: { stats: DashboardStats }) {
  const { t, locale } = useI18n();
  const dateLocale = getDateLocale(locale);
  const money = (value: string) => formatAmount(value, dateLocale);
  const kpis = [
    { label: t("adm.dash.kpiRevenue"), value: `${money(stats.revenueTotal)} TND`, sub: t("adm.dash.kpiMonth", { amount: money(stats.revenueThisMonth) }), color: "bg-ok" },
    { label: t("adm.dash.kpiToProcess"), value: String(stats.ordersToProcess), sub: t("adm.dash.kpiToProcessSub"), href: "/admin/orders", color: "bg-seal" },
    { label: t("adm.dash.kpiQuotes"), value: String(stats.pendingQuotes), sub: t("adm.dash.kpiQuotesSub", { count: stats.waitingOnClient }), href: "/admin/orders", color: "bg-blue" },
    { label: t("adm.dash.kpiClients"), value: String(stats.totalClients), sub: t("adm.dash.kpiClientsSub", { count: stats.newClientsThisWeek }), href: "/admin/users", color: "bg-accent-2" },
  ];

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">{t("adm.dash.eyebrow")}</p>
          <h1 className="text-[27px] text-navy sm:text-[30px]">{t("adm.dash.title")}</h1>
          <p className="mt-2 text-[13.5px] text-muted">{t("adm.dash.subtitle")}</p>
        </div>
        <Link href="/admin/orders" className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_22px_rgba(20,40,77,0.18)] transition hover:bg-navy-2">{t("adm.dash.manage")} <span aria-hidden="true">→</span></Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const content = <><div className="mb-5 flex items-center justify-between"><span className={`h-2.5 w-2.5 rounded-full ${kpi.color}`} />{kpi.href && <span className="text-[15px] text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue">→</span>}</div><div className="text-[25px] font-semibold tracking-tight text-navy">{kpi.value}</div><div className="mt-1.5 text-[12.5px] font-semibold text-ink">{kpi.label}</div><div className="mt-0.5 text-[11.5px] text-muted">{kpi.sub}</div></>;
          return kpi.href ? <Link key={kpi.label} href={kpi.href} className="group rounded-2xl border border-edge bg-white p-5 shadow-[0_8px_25px_rgba(20,40,77,0.04)] transition hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-[0_14px_35px_rgba(20,40,77,0.08)]">{content}</Link> : <div key={kpi.label} className="rounded-2xl border border-edge bg-white p-5 shadow-[0_8px_25px_rgba(20,40,77,0.04)]">{content}</div>;
        })}
      </div>

      <div className="mb-4 flex items-end justify-between gap-4">
        <div><h2 className="text-[18px] text-navy">{t("adm.dash.latest")}</h2><p className="mt-1 text-[12px] text-muted">{t("adm.dash.latestSub")}</p></div>
        <Link href="/admin/orders" className="shrink-0 text-[12.5px] font-semibold text-blue hover:text-blue-2">{t("adm.dash.viewAll")} <span aria-hidden="true">→</span></Link>
      </div>

      {stats.recentOrders.length === 0 ? (
        <div className="rounded-2xl border border-edge bg-white p-12 text-center text-muted shadow-[0_8px_25px_rgba(20,40,77,0.04)]">{t("adm.dash.empty")}</div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-edge bg-white shadow-[0_8px_25px_rgba(20,40,77,0.04)] md:block">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface text-[10.5px] uppercase tracking-[0.1em] text-muted"><tr><th className="px-5 py-3.5">{t("adm.col.reference")}</th><th className="px-5 py-3.5">{t("adm.col.client")}</th><th className="px-5 py-3.5">{t("adm.col.service")}</th><th className="px-5 py-3.5">{t("adm.col.status")}</th><th className="px-5 py-3.5">{t("adm.col.fileAccess")}</th><th className="px-5 py-3.5 text-right">{t("adm.col.amount")}</th></tr></thead>
              <tbody>
                {stats.recentOrders.map((order) => {
                  const needsAction = ACTION_NEEDED_STATUSES.has(order.status);
                  return <tr key={order.id} className="border-t border-mist transition hover:bg-surface">
                    <td className="px-5 py-4"><Link href={`/admin/orders/${order.id}`} className="flex items-center gap-2 font-semibold text-blue hover:text-blue-2">{needsAction && <span className="h-2 w-2 shrink-0 rounded-full bg-seal" />}{order.reference}</Link></td>
                    <td className="px-5 py-4 text-ink"><span className="font-medium">{order.user.firstName} {order.user.lastName}</span><div className="text-[11.5px] text-muted">{order.user.email}</div></td>
                    <td className="px-5 py-4 text-ink">{order.service.name}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${needsAction ? "bg-caution-soft text-caution" : "bg-blue-soft text-blue-2"}`}>{t(`app.status.${order.status}`)}</span></td>
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
              return <Link key={order.id} href={`/admin/orders/${order.id}`} className="block rounded-2xl border border-edge bg-white p-4 shadow-[0_6px_20px_rgba(20,40,77,0.04)]"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2 font-semibold text-blue">{needsAction && <span className="h-2 w-2 rounded-full bg-seal" />}{order.reference}</div><span className="shrink-0 font-semibold text-ink">{order.totalAmount} TND</span></div><div className="mt-2 text-[13px] font-medium text-ink">{order.user.firstName} {order.user.lastName}</div><div className="text-[11.5px] text-muted">{order.service.name}</div><div className="mt-3 flex flex-wrap items-center gap-2"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${needsAction ? "bg-caution-soft text-caution" : "bg-blue-soft text-blue-2"}`}>{t(`app.status.${order.status}`)}</span><FileAccessBadge access={order.fileAccess} /></div></Link>;
            })}
          </div>
        </>
      )}
    </div>
  );
}
