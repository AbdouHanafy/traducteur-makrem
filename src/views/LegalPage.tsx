"use client";

import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import PublicPageHero from "@/views/components/PublicPageHero";
import { useI18n } from "@/views/components/I18nProvider";
import { getDateLocale } from "@/lib/i18n";
import { LEGAL_SECTION_COUNT, LEGAL_UPDATED_AT, type LegalPageKey } from "@/lib/i18n-legal";

/** Page légale générique : titre, introduction et sections numérotées lues dans le dictionnaire. */
export default function LegalPage({ page }: { page: LegalPageKey }) {
  const { t, locale } = useI18n();
  const params = {
    name: t("brand.latin"),
    address: `${t("contact.addressLine1")}, ${t("contact.addressLine2")}`,
    phone: t("contact.phonePrimary"),
    email: t("contact.email"),
    registration: t("legal.notice.registration"),
  };
  const updated = new Date(LEGAL_UPDATED_AT).toLocaleDateString(getDateLocale(locale), { year: "numeric", month: "long", day: "numeric" });
  const sections = Array.from({ length: LEGAL_SECTION_COUNT[page] }, (_, index) => {
    const n = index + 1;
    return { n, title: t(`legal.${page}.s${n}.title`), body: t(`legal.${page}.s${n}.body`, params).trim() };
  }).filter((section) => section.body);

  return (
    <>
      <Topbar />
      <main className="flex-1">
        <PublicPageHero eyebrow={t("legal.updated", { date: updated })} title={t(`legal.${page}.title`)} description={t(`legal.${page}.intro`, params)} narrow />
        <section className="py-14">
          <div className="mx-auto max-w-[820px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 rounded-2xl border border-line bg-white p-6 shadow-[0_8px_25px_rgba(20,40,77,0.04)] sm:p-10">
              {sections.map((section) => (
                <article key={section.n}>
                  <h2 className="text-[19px] text-navy">{section.title}</h2>
                  <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-ink">{section.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
