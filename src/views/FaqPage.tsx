"use client";

import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import PublicPageHero from "@/views/components/PublicPageHero";
import { useI18n } from "@/views/components/I18nProvider";

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export default function FaqPage({ faqs }: { faqs: FaqEntry[] }) {
  const { t } = useI18n();
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <PublicPageHero eyebrow={t("nav.faq")} title={t("page.faq.title")} description={t("page.faq.description")} narrow />

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-[880px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-3">
              {faqs.map((item) => (
                <details
                  key={item.id}
                  className="group rounded-2xl border border-line bg-white px-5 py-4 shadow-[0_5px_20px_rgba(20,40,77,0.03)] transition open:border-blue/20 open:shadow-[0_12px_30px_rgba(20,40,77,0.07)] sm:px-6 sm:py-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-navy marker:content-none">
                    {item.question}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      className="shrink-0 text-blue transition-transform group-open:rotate-45"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{item.answer}</p>
                </details>
              ))}
            </div>

            <div className="mt-14 rounded-[16px] border border-line bg-white px-8 py-9 text-center">
              <h2 className="text-[22px] text-navy">{t("page.faq.other")}</h2>
              <p className="mx-auto mt-2.5 max-w-[48ch] text-[15px] text-muted">
                {t("page.faq.otherDesc")}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3.5">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-[24px] py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-blue-2"
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
