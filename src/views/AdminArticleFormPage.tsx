"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaPicker from "@/views/components/MediaPicker";
import { useI18n } from "@/views/components/I18nProvider";
import TranslationEditor from "@/views/components/TranslationEditor";
import type { TranslationsMap } from "@/lib/localize";

export interface ArticleFormValues {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  published: boolean;
  translations: TranslationsMap;
}

export default function AdminArticleFormPage({ initial }: { initial: ArticleFormValues }) {
  const router = useRouter();
  const { t } = useI18n();
  const isEdit = Boolean(initial.id);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function slugify(title: string) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isEdit ? `/api/admin/articles/${initial.id}` : "/api/admin/articles";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || t("adm.errorGeneric"));
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[720px] px-6 py-14">
      <h1 className="mb-8 text-[26px] text-navy">{isEdit ? t("adm.articleForm.titleEdit") : t("adm.articleForm.titleNew")}</h1>

      <form onSubmit={onSubmit} className="grid gap-5 rounded-2xl border border-line bg-white p-7">
        {error && (
          <div className="rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[13.5px] text-danger">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.title")}</label>
          <input
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({ ...f, title, slug: isEdit ? f.slug : slugify(title) }));
            }}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.serviceForm.slug")}</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            {t("adm.articleForm.summary")} <span className="font-normal text-muted">{t("adm.articleForm.summaryHint")}</span>
          </label>
          <textarea
            required
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.articleForm.content")}</label>
          <textarea
            required
            rows={12}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.articleForm.cover")}</label>
          <MediaPicker value={form.coverImageUrl} onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))} />
        </div>

        <TranslationEditor
          fields={[
            { name: "title", label: t("adm.title") },
            { name: "excerpt", label: t("adm.articleForm.summary"), multiline: true, rows: 2 },
            { name: "body", label: t("adm.articleForm.content"), multiline: true, rows: 10 },
          ]}
          base={{ title: form.title, excerpt: form.excerpt, body: form.body }}
          value={form.translations}
          onChange={(translations) => setForm((f) => ({ ...f, translations }))}
        />

        <label className="flex items-center gap-2.5 text-[14px] text-ink">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            className="h-4 w-4"
          />
          {t("adm.articleForm.published")}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 inline-flex w-fit items-center justify-center rounded-xl bg-blue px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:opacity-60"
        >
          {loading ? t("adm.saving") : t("adm.save")}
        </button>
      </form>
    </div>
  );
}
