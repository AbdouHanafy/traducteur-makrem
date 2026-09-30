"use client";

import Link from "next/link";
import { useI18n } from "@/views/components/I18nProvider";

export interface ServiceCardData {
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  pricePerPage: string;
}

const SERVICE_COPY: Record<string, { name: string; description: string }> = {
  "etat-civil": { name: "services.civil", description: "services.civilDetail" },
  "diplomes-releves": { name: "services.diplomas", description: "services.diplomasDetail" },
  "contrats-actes": { name: "services.contracts", description: "services.contractsDetail" },
  "documents-judiciaires": { name: "services.court", description: "services.courtDetail" },
  interpretariat: { name: "services.interpreting", description: "services.interpretingDetail" },
};

/**
 * Carte service partagée — utilisée sur la home (teaser) et sur /services (détail), pour que
 * les deux restent visuellement identiques sans dupliquer le balisage à chaque évolution.
 */
export default function ServiceCard({ service, anchor = true }: { service: ServiceCardData; anchor?: boolean }) {
  const { locale, t } = useI18n();
  const localizedCopy = SERVICE_COPY[service.slug];
  const name = locale === "fr" || !localizedCopy ? service.name : t(localizedCopy.name);
  const description = locale === "fr" || !localizedCopy ? service.description : t(localizedCopy.description);
  return (
    <div
      id={anchor ? service.slug : undefined}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[var(--shadow-lg)]"
    >
      <div className="relative h-44 w-full shrink-0 overflow-hidden">
        {service.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,var(--color-mist),var(--color-line))]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2456B8" strokeWidth="1.6">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M8 13h8M8 17h5" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,26,52,0)_45%,rgba(12,26,52,.82)_100%)]" />
        <h3 className="absolute inset-x-0 bottom-0 px-5 pb-4 font-serif text-[19px] leading-tight text-white [text-shadow:0_1px_6px_rgba(0,0,0,.35)]">
          {name}
        </h3>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
        <p className="flex-1 text-[14px] leading-relaxed text-muted">{description}</p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="inline-flex items-center rounded-full bg-blue-soft px-3 py-1.5 text-[12px] font-semibold text-blue-2">
            {Number(service.pricePerPage) > 0 ? t("service.from", { price: service.pricePerPage }) : t("service.quote")}
          </span>
          <Link
            href={`/commander?service=${encodeURIComponent(service.slug)}`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-navy px-4 py-2.5 text-[13px] font-semibold text-white transition-colors group-hover:bg-blue"
          >
            {t("service.order")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
