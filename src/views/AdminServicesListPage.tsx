"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/views/components/I18nProvider";

interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  pricePerPage: string;
  imageUrl: string | null;
  active: boolean;
}

export default function AdminServicesListPage({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleActive(service: ServiceRow) {
    setBusyId(service.id);
    if (service.active) {
      await fetch(`/api/admin/services/${service.id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: service.slug,
          name: service.name,
          description: service.description,
          pricePerPage: service.pricePerPage,
          imageUrl: service.imageUrl ?? "",
          active: true,
        }),
      });
    }
    setBusyId(null);
    router.refresh();
  }

  async function move(id: string, direction: "up" | "down") {
    setBusyId(id);
    await fetch(`/api/admin/services/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    setBusyId(null);
    router.refresh();
  }

  function moveButtons(id: string, index: number) {
    return (
      <span className="inline-flex items-center">
        <button type="button" disabled={index === 0 || busyId === id} onClick={() => move(id, "up")} className="rounded-md p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30" aria-label={t("adm.moveUp")}>↑</button>
        <button type="button" disabled={index === services.length - 1 || busyId === id} onClick={() => move(id, "down")} className="rounded-md p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30" aria-label={t("adm.moveDown")}>↓</button>
      </span>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] text-navy">{t("adm.services.title")}</h1>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2"
        >
          {t("adm.services.new")}
        </Link>
      </div>

      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-white md:block">
        <table className="w-full text-left text-[13.5px]">
          <thead className="bg-mist text-[12px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3">{t("adm.col.service")}</th>
              <th className="px-5 py-3">{t("adm.services.colPrice")}</th>
              <th className="px-5 py-3">{t("adm.col.status")}</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={service.id} className="border-t border-line">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {service.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={service.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-mist" />
                    )}
                    <div>
                      <div className="font-semibold text-ink">{service.name}</div>
                      <div className="text-[12px] text-muted">{service.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink">{service.pricePerPage} TND</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                      service.active ? "bg-ok-soft text-ok" : "bg-mist text-muted"
                    }`}
                  >
                    {service.active ? t("adm.active") : t("adm.disabled")}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {moveButtons(service.id, index)}
                    <Link href={`/admin/services/${service.id}`} className="font-semibold text-blue hover:text-blue-2">
                      {t("adm.edit")}
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === service.id}
                      onClick={() => toggleActive(service)}
                      className="text-muted hover:text-navy disabled:opacity-50"
                    >
                      {service.active ? t("adm.disable") : t("adm.reenable")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile : cartes */}
      <div className="grid gap-3 md:hidden">
        {services.map((service, index) => (
          <div key={service.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center gap-3">
              {service.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={service.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-11 w-11 shrink-0 rounded-lg bg-mist" />
              )}
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink">{service.name}</div>
                <div className="truncate text-[12px] text-muted">{service.slug}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[13.5px] font-semibold text-ink">{service.pricePerPage} TND</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                  service.active ? "bg-ok-soft text-ok" : "bg-mist text-muted"
                }`}
              >
                {service.active ? t("adm.active") : t("adm.disabled")}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4 border-t border-line pt-3">
              {moveButtons(service.id, index)}
              <Link href={`/admin/services/${service.id}`} className="text-[13.5px] font-semibold text-blue hover:text-blue-2">
                {t("adm.edit")}
              </Link>
              <button
                type="button"
                disabled={busyId === service.id}
                onClick={() => toggleActive(service)}
                className="text-[13.5px] font-semibold text-muted hover:text-navy disabled:opacity-50"
              >
                {service.active ? t("adm.disable") : t("adm.reenable")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
