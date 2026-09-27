"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  published: boolean;
}

export default function AdminArticlesListPage({ articles }: { articles: ArticleRow[] }) {
  const router = useRouter();

  async function move(id: string, direction: "up" | "down") {
    await fetch(`/api/admin/articles/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    router.refresh();
  }

  async function deleteArticle(id: string) {
    if (!confirm("Supprimer cet article ?")) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-14">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] text-navy">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2"
        >
          Nouvel article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-white p-10 text-center text-muted">
          Aucun article pour l&apos;instant.
        </div>
      ) : (
        <div className="grid gap-3">
          {articles.map((article, index) => (
            <div
              key={article.id}
              className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 rounded-[14px] border border-line bg-white p-4"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(article.id, "up")}
                  className="rounded-[7px] p-1 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                  aria-label="Monter"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === articles.length - 1}
                  onClick={() => move(article.id, "down")}
                  className="rounded-[7px] p-1 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                  aria-label="Descendre"
                >
                  ↓
                </button>
              </div>

              {article.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={article.coverImageUrl} alt="" className="h-14 w-14 rounded-[8px] object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-[8px] bg-mist" />
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{article.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      article.published ? "bg-ok-soft text-ok" : "bg-mist text-muted"
                    }`}
                  >
                    {article.published ? "Publié" : "Brouillon"}
                  </span>
                </div>
                <div className="text-[12px] text-muted">{article.slug}</div>
              </div>

              <div className="flex items-center gap-3">
                <Link href={`/admin/articles/${article.id}`} className="text-[13.5px] font-semibold text-blue hover:text-blue-2">
                  Modifier
                </Link>
                <button
                  type="button"
                  onClick={() => deleteArticle(article.id)}
                  className="text-[13.5px] font-semibold text-muted hover:text-[#9c2c2c]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
