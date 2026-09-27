"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaPicker from "@/views/components/MediaPicker";

export interface ServiceFormValues {
  id?: string;
  slug: string;
  name: string;
  description: string;
  pricePerPage: string;
  imageUrl: string;
  active: boolean;
}

export default function AdminServiceFormPage({ initial }: { initial: ServiceFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function slugify(name: string) {
    return name
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

    const url = isEdit ? `/api/admin/services/${initial.id}` : "/api/admin/services";
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

    router.push("/admin/services");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 py-14">
      <h1 className="mb-8 text-[26px] text-navy">{isEdit ? "Modifier le service" : "Nouveau service"}</h1>

      <form onSubmit={onSubmit} className="grid gap-5 rounded-[14px] border border-line bg-white p-7">
        {error && (
          <div className="rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Nom</label>
          <input
            required
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({ ...f, name, slug: isEdit ? f.slug : slugify(name) }));
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
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Description</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            Prix par page (TND) — 0 = &quot;sur devis&quot;
          </label>
          <input
            required
            type="number"
            min={0}
            step="0.001"
            value={form.pricePerPage}
            onChange={(e) => setForm((f) => ({ ...f, pricePerPage: e.target.value }))}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Photo</label>
          <MediaPicker value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
        </div>

        <label className="flex items-center gap-2.5 text-[14px] text-ink">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="h-4 w-4"
          />
          Service actif (visible sur le site)
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
