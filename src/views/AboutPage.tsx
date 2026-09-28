"use client";

import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import PublicPageHero from "@/views/components/PublicPageHero";
import { useI18n } from "@/views/components/I18nProvider";

const VALUES = [
  {
    title: "page.about.rigor",
    desc: "page.about.rigorDesc",
  },
  {
    title: "page.about.confidentiality",
    desc: "page.about.confidentialityDesc",
  },
  {
    title: "page.about.official",
    desc: "page.about.officialDesc",
  },
  {
    title: "page.about.deadlines",
    desc: "page.about.deadlinesDesc",
  },
];

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <PublicPageHero eyebrow={t("page.about.eyebrow")} title={t("page.about.title")} description={t("page.about.description")} />

        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-4 sm:px-6 md:grid-cols-[1.1fr_.9fr] lg:gap-16 lg:px-8">
            <div>
              <h2 className="text-[26px] text-navy">{t("page.about.introTitle")}</h2>
              <p className="mt-4 text-[15.5px] leading-relaxed text-muted">
                {t("page.about.p1")}
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-muted">
                {t("page.about.p2")}
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-muted">
                {t("page.about.p3")}
              </p>
            </div>

            <div className="rounded-[20px] border border-line bg-white p-7 shadow-[0_12px_38px_rgba(20,40,77,0.06)]">
              <h3 className="text-[17px] text-navy">{t("page.about.practice")}</h3>
              <dl className="mt-4 grid gap-4 text-[14.5px]">
                <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                  <dt className="text-muted">{t("hero.status")}</dt>
                  <dd className="text-right font-medium text-ink">
                    {t("hero.statusValue")}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                  <dt className="text-muted">{t("page.about.jurisdiction")}</dt>
                  <dd className="text-right font-medium text-ink">{t("page.about.court")}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                  <dt className="text-muted">{t("page.about.workingLanguages")}</dt>
                  <dd className="text-right font-medium text-ink">{t("hero.languagesValue")}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">{t("page.about.office")}</dt>
                  <dd className="text-right font-medium text-ink">
                    {t("contact.addressLine1")}, {t("contact.addressLine2")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="bg-white py-18">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="mb-11 max-w-[660px]">
              <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-blue">
                <span className="h-0.5 w-5.5 rounded bg-blue" />
                {t("page.about.commitments")}
              </span>
              <h2 className="text-[clamp(26px,3vw,34px)] text-navy">
                {t("page.about.commitmentsTitle")}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-[18px] border border-line px-5 py-6 transition hover:-translate-y-0.5 hover:border-blue/25 hover:shadow-[0_10px_28px_rgba(20,40,77,0.06)]">
                  <h3 className="text-[16.5px] text-navy">{t(v.title)}</h3>
                  <p className="mt-2 text-[13.5px] text-muted">{t(v.desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[1160px] px-[22px] text-center">
            <h2 className="text-[24px] text-navy">{t("page.about.question")}</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3.5">
              <Link
                href="/commander"
                className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-[24px] py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-blue-2"
              >
                {t("nav.orderLong")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-[11px] border-[1.5px] border-line px-[24px] py-[13px] text-[15px] font-semibold text-navy transition-colors hover:border-navy"
              >
                {t("cta.contact")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
