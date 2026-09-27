"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaPicker from "@/views/components/MediaPicker";

export interface ArticleFormValues {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  published: boolean;
}

export default function AdminArticleFormPage({ initial }: { initial: ArticleFormValues }) {
  const router = useRouter();
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
      setError(data?.error || "Une erreur est survenue.");
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[720px] px-6 py-14">
      <h1 className="mb-8 text-[26px] text-navy">{isEdit ? "Modifier l'article" : "Nouvel article"}</h1>

      <form onSubmit={onSubmit} className="grid gap-5 rounded-[14px] border border-line bg-white p-7">
        {error && (
          <div className="rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Titre</label>
          <input
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({ ...f, title, slug: isEdit ? f.slug : slugify(title) }));
            }}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Slug</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            Résumé <span className="font-normal text-muted">(affiché dans la liste des articles)</span>
          </label>
          <textarea
            required
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Contenu</label>
          <textarea
            required
            rows={12}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Image de couverture</label>
          <MediaPicker value={form.coverImageUrl} onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))} />
        </div>

        <label className="flex items-center gap-2.5 text-[14px] text-ink">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            className="h-4 w-4"
          />
          Publié (visible sur le site)
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 inline-flex w-fit items-center justify-center rounded-[11px] bg-blue px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:opacity-60"
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
