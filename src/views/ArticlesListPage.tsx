import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";

export interface ArticleListItem {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
}

export default function ArticlesListPage({ articles }: { articles: ArticleListItem[] }) {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <section className="bg-[linear-gradient(180deg,#0C1A34_0%,#14284D_100%)] py-18 text-white">
          <div className="mx-auto max-w-[1160px] px-[22px]">
            <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#8fb4ff]">
              <span className="h-0.5 w-5.5 rounded bg-[#8fb4ff]" />
              Actualités
            </span>
            <h1 className="max-w-[24ch] text-[clamp(30px,4vw,44px)] text-white">
              Articles &amp; actualités du cabinet
            </h1>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-[1160px] px-[22px]">
            {articles.length === 0 ? (
              <div className="rounded-[16px] border border-line bg-white p-10 text-center text-muted">
                Aucun article publié pour l&apos;instant.
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
                        Lire l&apos;article
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
