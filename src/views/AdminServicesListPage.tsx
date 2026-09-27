"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] text-navy">Services</h1>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2"
        >
          Nouveau service
        </Link>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-line bg-white">
        <table className="w-full text-left text-[13.5px]">
          <thead className="bg-mist text-[12px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3">Service</th>
              <th className="px-5 py-3">Prix / page</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-t border-line">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {service.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={service.imageUrl} alt="" className="h-10 w-10 rounded-[8px] object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-[8px] bg-mist" />
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
                    {service.active ? "Actif" : "Désactivé"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/services/${service.id}`} className="font-semibold text-blue hover:text-blue-2">
                      Modifier
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === service.id}
                      onClick={() => toggleActive(service)}
                      className="text-muted hover:text-navy disabled:opacity-50"
                    >
                      {service.active ? "Désactiver" : "Réactiver"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
