"use client";

import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import PublicPageHero from "@/views/components/PublicPageHero";
import { useI18n } from "@/views/components/I18nProvider";

export interface ArticleDetailData {
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

export default function ArticleDetailPage({ article }: { article: ArticleDetailData }) {
  const { locale, t } = useI18n();
  const dateLocale = locale === "ar" ? "ar-TN" : locale === "it" ? "it-IT" : locale === "en" ? "en-GB" : "fr-FR";
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <PublicPageHero eyebrow={t("page.article.eyebrow")} title={article.title} narrow>
            <Link href="/articles" className="mb-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent-light hover:text-white">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              {t("page.article.all")}
            </Link>
            {article.publishedAt && (
              <p className="absolute bottom-[-35px] text-[12px] text-slate-400">
                {t("page.article.published", { date: new Date(article.publishedAt).toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" }) })}
              </p>
            )}
        </PublicPageHero>

        <section className="py-[calc(4rem*var(--section-scale))]">
          <div className="mx-auto max-w-[880px] px-4 sm:px-6 lg:px-8">
            {article.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.coverImageUrl}
                alt=""
                className="mb-10 h-auto max-h-[420px] w-full rounded-2xl object-cover"
              />
            )}
            <p className="whitespace-pre-line text-[16px] leading-8 text-ink">{article.body}</p>

            <div className="mt-14 rounded-2xl border border-line bg-white px-8 py-9 text-center">
              <h2 className="text-[22px] text-navy">{t("page.about.question")}</h2>
              <div className="mt-6 flex flex-wrap justify-center gap-3.5">
                <Link
                  href="/commander"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue px-[24px] py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-blue-2"
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
