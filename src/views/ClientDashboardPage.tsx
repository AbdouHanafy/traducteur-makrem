"use client";

import Link from "next/link";
import { getDateLocale } from "@/lib/i18n";
import { useI18n } from "@/views/components/I18nProvider";

const CLIENT_ACTION_STATUSES = new Set(["DEVIS_A_VALIDER", "EN_ATTENTE_ACOMPTE", "FICHIER_EN_ATTENTE_DE_SOLDE"]);
const DONE_STATUSES = new Set(["TELECHARGEABLE", "TERMINEE", "ANNULEE"]);

interface ClientOrder {
  id: string;
  reference: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  service: { name: string };
}

function formatDate(value: string, dateLocale: string) {
  return new Intl.DateTimeFormat(dateLocale, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default function ClientDashboardPage({ firstName, orders }: { firstName: string; orders: ClientOrder[] }) {
  const { t, locale } = useI18n();
  const dateLocale = getDateLocale(locale);
  const statusLabel = (status: string) => t(`app.status.${status}`);
  const actionOrders = orders.filter((order) => CLIENT_ACTION_STATUSES.has(order.status));
  const activeCount = orders.filter((order) => !DONE_STATUSES.has(order.status)).length;
  const availableCount = orders.filter((order) => order.status === "TELECHARGEABLE").length;
  const recentOrders = orders.slice(0, 4);
  const priorityOrder = actionOrders[0];

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <section className="relative mb-7 overflow-hidden rounded-[22px] bg-navy px-6 py-7 text-white shadow-[0_18px_45px_rgba(20,40,77,0.16)] sm:px-8 sm:py-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[45px] border-white/[0.04]" aria-hidden="true" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">{t("app.dash.welcome")}</p>
            <h1 className="text-[27px] text-white sm:text-[32px]">{t("app.dash.hello", { name: firstName })}</h1>
            <p className="mt-2 max-w-xl text-[13.5px] leading-6 text-slate-300">{t("app.dash.intro")}</p>
          </div>
          <Link href="/commander" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-[13.5px] font-semibold text-navy shadow-lg transition hover:-translate-y-0.5">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            {t("app.dash.request")}
          </Link>
        </div>
      </section>

      <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: t("app.dash.statActive"), value: activeCount, note: t("app.dash.statActiveNote"), icon: "M4 6h16M4 12h16M4 18h10", color: "bg-blue-soft text-blue" },
          { label: t("app.dash.statAction"), value: actionOrders.length, note: actionOrders.length ? t("app.dash.statActionNote") : t("app.dash.statUpToDate"), icon: "M12 8v4m0 4h.01M10.3 3.7 2-1.2 2 1.2 7 12.2A2 2 0 0 1 19.6 19H4.4a2 2 0 0 1-1.7-3.1l7.6-12.2Z", color: "bg-[#fff3df] text-[#a66418]" },
          { label: t("app.dash.statReady"), value: availableCount, note: t("app.dash.statReadyNote"), icon: "M12 3v12m0 0-4-4m4 4 4-4M4 21h16", color: "bg-ok-soft text-ok" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-4 rounded-2xl border border-[#e4e9f1] bg-white p-5 shadow-[0_8px_25px_rgba(20,40,77,0.04)]">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${stat.color}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={stat.icon} /></svg></span>
            <div><div className="text-[23px] font-semibold leading-none text-navy">{stat.value}</div><div className="mt-1.5 text-[12.5px] font-semibold text-ink">{stat.label}</div><div className="text-[11.5px] text-muted">{stat.note}</div></div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,.75fr)]">
        <section className="overflow-hidden rounded-2xl border border-[#e4e9f1] bg-white shadow-[0_8px_25px_rgba(20,40,77,0.04)]">
          <div className="flex items-center justify-between border-b border-mist px-5 py-4 sm:px-6">
            <div><h2 className="text-[17px] text-navy">{t("app.dash.recent")}</h2><p className="mt-0.5 text-[12px] text-muted">{t("app.dash.recentSub")}</p></div>
            <Link href="/dashboard/orders" className="text-[12.5px] font-semibold text-blue hover:text-blue-2">{t("app.dash.seeAll")}</Link>
          </div>
          {recentOrders.length ? (
            <div className="divide-y divide-mist">
              {recentOrders.map((order) => {
                const needsAction = CLIENT_ACTION_STATUSES.has(order.status);
                return (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#f8faff] sm:px-6">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${needsAction ? "bg-[#fff3df] text-[#a66418]" : "bg-blue-soft text-blue"}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h9l4 4v14H6V3Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg></span>
                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="font-semibold text-ink">{order.reference}</span><span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${needsAction ? "bg-[#fff3df] text-[#9a5b12]" : "bg-blue-soft text-blue-2"}`}>{statusLabel(order.status)}</span></div><div className="mt-1 truncate text-[12.5px] text-muted">{order.service.name} · {formatDate(order.createdAt, dateLocale)}</div></div>
                    <svg className="shrink-0 text-slate-400" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center"><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-blue-soft text-blue"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg></div><p className="font-semibold text-ink">{t("app.dash.noOrders")}</p><p className="mt-1 text-[13px] text-muted">{t("app.dash.noOrdersHint")}</p></div>
          )}
        </section>

        <aside className="grid content-start gap-5">
          {priorityOrder ? (
            <div className="rounded-2xl border border-[#f1d7ae] bg-[#fffaf1] p-5">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#9a5b12]"><span className="h-2 w-2 rounded-full bg-[#d28a2d]" />{t("app.dash.statAction")}</div>
              <h2 className="text-[17px] text-navy">{statusLabel(priorityOrder.status)}</h2>
              <p className="mt-1.5 text-[12.5px] leading-5 text-muted">{t("app.dash.actionText", { reference: priorityOrder.reference })}</p>
              <Link href={`/dashboard/orders/${priorityOrder.id}`} className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-blue">{t("app.dash.openOrder")} <span aria-hidden="true">→</span></Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#cde8d9] bg-[#f3fbf6] p-5"><div className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-ok-soft text-ok"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" /></svg></div><h2 className="text-[17px] text-navy">{t("app.dash.allGood")}</h2><p className="mt-1.5 text-[12.5px] leading-5 text-muted">{t("app.dash.allGoodText")}</p></div>
          )}

          <div className="rounded-2xl border border-[#e4e9f1] bg-white p-5">
            <h2 className="text-[15px] text-navy">{t("app.dash.helpTitle")}</h2>
            <p className="mt-1.5 text-[12.5px] leading-5 text-muted">{t("app.dash.helpText")}</p>
            <Link href="/dashboard/support" className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-blue">{t("app.dash.contactFirm")} <span aria-hidden="true">→</span></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
