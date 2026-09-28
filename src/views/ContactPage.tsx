"use client";

import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import PublicPageHero from "@/views/components/PublicPageHero";
import { useI18n } from "@/views/components/I18nProvider";

const CHANNELS = [
  {
    id: "phone",
    labelKey: "common.phone",
    lineKeys: ["contact.phonePrimary", "contact.phoneSecondary"],
    icon: (
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.68 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0122 16.92z" />
    ),
  },
  {
    id: "email",
    labelKey: "common.email",
    lineKeys: ["contact.email"],
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </>
    ),
  },
  {
    id: "office",
    labelKey: "page.contact.office",
    lineKeys: ["contact.addressLine1", "contact.addressLine2"],
    icon: (
      <>
        <path d="M12 21s-7-6.5-7-11a7 7 0 0114 0c0 4.5-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  },
];

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <PublicPageHero eyebrow={t("nav.contact")} title={t("page.contact.title")} description={t("page.contact.description")} />

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {CHANNELS.map((c) => {
                const lines = c.lineKeys.map((key) => t(key));
                const href = c.id === "phone"
                  ? `tel:${lines[0].replace(/[^+\d]/g, "")}`
                  : c.id === "email" ? `mailto:${lines[0]}` : undefined;
                const cardClass =
                  "block rounded-[18px] border border-line bg-white px-6 py-7 shadow-[0_8px_28px_rgba(20,40,77,0.04)] transition hover:-translate-y-0.5 hover:border-blue/25 hover:shadow-[0_14px_35px_rgba(20,40,77,0.08)]";
                const content = (
                  <>
                    <div className="mb-4 grid h-11.5 w-11.5 place-items-center rounded-[11px] bg-blue-soft text-blue-2">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        {c.icon}
                      </svg>
                    </div>
                    <h2 className="text-[16.5px] text-navy">{t(c.labelKey)}</h2>
                    <div className="mt-2 text-[14.5px] text-muted">
                      {lines.map((l) => (
                        <div key={l}>{l}</div>
                      ))}
                    </div>
                  </>
                );
                return href ? (
                  <Link key={c.id} href={href} className={cardClass}>
                    {content}
                  </Link>
                ) : (
                  <div key={c.id} className={cardClass}>
                    {content}
                  </div>
                );
              })}
            </div>

            <div className="mt-14 grid gap-8 rounded-[16px] border border-line bg-white px-8 py-9 md:grid-cols-[1.2fr_.8fr] md:items-center">
              <div>
                <h2 className="text-[22px] text-navy">{t("page.contact.ready")}</h2>
                <p className="mt-2.5 max-w-[56ch] text-[15px] text-muted">
                  {t("page.contact.readyDesc")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3.5 md:justify-end">
                <Link
                  href="/commander"
                  className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-[24px] py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-blue-2"
                >
                  {t("nav.orderLong")}
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
