"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/views/components/I18nProvider";

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  published: boolean;
}

export default function AdminArticlesListPage({ articles }: { articles: ArticleRow[] }) {
  const router = useRouter();
  const { t } = useI18n();

  async function move(id: string, direction: "up" | "down") {
    await fetch(`/api/admin/articles/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    router.refresh();
  }

  async function deleteArticle(id: string) {
    if (!confirm(t("adm.articles.deleteConfirm"))) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] text-navy">{t("adm.articles.title")}</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2"
        >
          {t("adm.articles.new")}
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-muted">
          {t("adm.articles.empty")}
        </div>
      ) : (
        <div className="grid gap-3">
          {articles.map((article, index) => (
            <div
              key={article.id}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:grid sm:grid-cols-[auto_auto_1fr_auto] sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-3 sm:contents">
                <div className="flex flex-row gap-1 sm:flex-col">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(article.id, "up")}
                    className="rounded-md p-1 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                    aria-label={t("adm.moveUp")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === articles.length - 1}
                    onClick={() => move(article.id, "down")}
                    className="rounded-md p-1 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                    aria-label={t("adm.moveDown")}
                  >
                    ↓
                  </button>
                </div>

                {article.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImageUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-mist" />
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{article.title}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        article.published ? "bg-ok-soft text-ok" : "bg-mist text-muted"
                      }`}
                    >
                      {article.published ? t("adm.published") : t("adm.draft")}
                    </span>
                  </div>
                  <div className="truncate text-[12px] text-muted">{article.slug}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-line pt-3 sm:border-t-0 sm:pt-0">
                <Link href={`/admin/articles/${article.id}`} className="text-[13.5px] font-semibold text-blue hover:text-blue-2">
                  {t("adm.edit")}
                </Link>
                <button
                  type="button"
                  onClick={() => deleteArticle(article.id)}
                  className="text-[13.5px] font-semibold text-muted hover:text-danger"
                >
                  {t("adm.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
