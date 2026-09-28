"use client";

import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import PublicPageHero from "@/views/components/PublicPageHero";
import { useI18n } from "@/views/components/I18nProvider";

export interface ArticleListItem {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
}

export default function ArticlesListPage({ articles }: { articles: ArticleListItem[] }) {
  const { t } = useI18n();
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <PublicPageHero eyebrow={t("page.articles.eyebrow")} title={t("page.articles.title")} description={t("page.articles.description")} />

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            {articles.length === 0 ? (
              <div className="rounded-[16px] border border-line bg-white p-10 text-center text-muted">
                {t("page.articles.empty")}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="group overflow-hidden rounded-[16px] border border-line bg-white shadow-[var(--shadow-md)] transition hover:-translate-y-0.5"
                  >
                    {article.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={article.coverImageUrl} alt="" className="h-44 w-full object-cover" />
                    ) : (
                      <div className="grid h-44 w-full place-items-center bg-[linear-gradient(135deg,#EDF0F5,#DCE3EE)]">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2456B8" strokeWidth="1.6">
                          <path d="M4 4h16v16H4z" />
                          <path d="M8 9h8M8 13h8M8 17h5" />
                        </svg>
                      </div>
                    )}
                    <div className="px-6 pb-6 pt-5">
                      <h2 className="text-[18px] text-navy transition-colors group-hover:text-blue">
                        {article.title}
                      </h2>
                      <p className="mt-2 text-[14px] text-muted">{article.excerpt}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-blue">
                        {t("page.articles.read")}
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
