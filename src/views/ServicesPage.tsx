"use client";

import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import ServiceCard, { type ServiceCardData } from "@/views/components/ServiceCard";
import PublicPageHero from "@/views/components/PublicPageHero";
import { useI18n } from "@/views/components/I18nProvider";

export default function ServicesPage({ services }: { services: ServiceCardData[] }) {
  const { t } = useI18n();
  return (
    <>
      <Topbar />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <PublicPageHero eyebrow={t("page.services.eyebrow")} title={t("page.services.title")} description={t("page.services.description")} />

        <section className="py-[calc(4rem*var(--section-scale))] sm:py-[calc(5rem*var(--section-scale))]">
          <div className="mx-auto max-w-(--site-width) px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s.slug} service={s} />
              ))}
            </div>

            <div className="mt-14 rounded-3xl border border-line bg-white px-6 py-9 text-center shadow-[0_10px_35px_rgba(20,40,77,0.05)] sm:px-8">
              <h2 className="text-[24px] text-navy">{t("page.services.missing")}</h2>
              <p className="mx-auto mt-2.5 max-w-[56ch] text-[15px] text-muted">
                {t("page.services.missingDesc")}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3.5">
                <Link
                  href="/commander"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue px-[24px] py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-blue-2"
                >
                  {t("nav.orderLong")}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-xl border-[1.5px] border-line px-[24px] py-[13px] text-[15px] font-semibold text-navy transition-colors hover:border-navy"
                >
                  {t("cta.contact")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
