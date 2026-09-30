"use client";

import Link from "next/link";
import ServiceCard, { type ServiceCardData } from "@/views/components/ServiceCard";
import { useI18n } from "@/views/components/I18nProvider";

/**
 * Section Services (home) — mêmes cartes que /services (voir ServiceCard.tsx), pour une
 * identité cohérente entre la page d'accueil et la page détail. Contenu géré depuis le
 * backoffice (/admin/services).
 */
export default function Services({ services }: { services: ServiceCardData[] }) {
  const { t } = useI18n();
  return (
    <section id="services" className="py-[calc(5.5rem*var(--section-scale))]">
      <div className="mx-auto max-w-(--site-width) px-[22px]">
        <div className="mb-14 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-[660px]">
            <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-blue">
              <span className="h-0.5 w-5.5 rounded bg-blue" />
              {t("home.servicesEyebrow")}
            </span>
            <h2 className="text-[clamp(28px,3.4vw,40px)] text-navy">
              {t("home.servicesTitle")}
            </h2>
          </div>
          <p className="max-w-[34ch] text-[14.5px] text-muted md:text-right">
            {t("home.servicesDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} anchor={false} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[13px] text-muted">
            {t("home.priceNote")}
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-blue hover:text-blue-2"
          >
            {t("home.allServices")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
