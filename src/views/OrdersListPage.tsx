"use client";

import Link from "next/link";
import { useI18n } from "@/views/components/I18nProvider";

interface OrderRow {
  id: string;
  reference: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  service: { name: string };
}

export default function OrdersListPage({ orders }: { orders: OrderRow[] }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-[1050px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">{t("app.orders.eyebrow")}</p>
          <h1 className="text-[27px] text-navy sm:text-[30px]">{t("app.orders.title")}</h1>
          <p className="mt-2 text-[13.5px] text-muted">{t("app.orders.subtitle")}</p>
        </div>
        <Link
          href="/commander"
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-[13.5px] font-semibold text-white shadow-[0_8px_22px_rgba(20,40,77,0.18)] transition hover:bg-navy-2"
        >
          {t("app.nav.newOrder")}
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-edge bg-white p-12 text-center text-muted shadow-[0_8px_25px_rgba(20,40,77,0.04)]">
          {t("app.orders.empty")}
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="group grid grid-cols-1 gap-3 rounded-2xl border border-edge bg-white px-6 py-5 shadow-[0_6px_20px_rgba(20,40,77,0.035)] transition hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-[0_12px_30px_rgba(20,40,77,0.07)] sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4"
            >
              <div className="min-w-0">
                <div className="font-serif text-[17px] text-navy">{order.reference}</div>
                <div className="mt-1 truncate text-[13.5px] text-muted">{order.service.name}</div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                <span className="inline-flex items-center rounded-full bg-blue-soft px-3 py-1 text-[12.5px] font-semibold text-blue-2">
                  {t(`app.status.${order.status}`)}
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
