import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";

export interface ArticleDetailData {
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

export default function ArticleDetailPage({ article }: { article: ArticleDetailData }) {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <section className="bg-[linear-gradient(180deg,#0C1A34_0%,#14284D_100%)] py-18 text-white">
          <div className="mx-auto max-w-[820px] px-[22px]">
            <Link href="/articles" className="mb-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#8fb4ff] hover:text-white">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              Tous les articles
            </Link>
            <h1 className="max-w-[28ch] text-[clamp(28px,3.8vw,42px)] text-white">{article.title}</h1>
            {article.publishedAt && (
              <p className="mt-3 text-[13.5px] text-[#8fb4ff]">
                Publié le {new Date(article.publishedAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            )}
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[820px] px-[22px]">
            {article.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.coverImageUrl}
                alt=""
                className="mb-10 h-auto max-h-[420px] w-full rounded-[16px] object-cover"
              />
            )}
            <p className="whitespace-pre-line text-[16px] leading-relaxed text-ink">{article.body}</p>

            <div className="mt-14 rounded-[16px] border border-line bg-white px-8 py-9 text-center">
              <h2 className="text-[22px] text-navy">Une traduction à faire certifier ?</h2>
              <div className="mt-6 flex flex-wrap justify-center gap-3.5">
                <Link
                  href="/commander"
                  className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-[24px] py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-blue-2"
                >
                  Commander une traduction
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
