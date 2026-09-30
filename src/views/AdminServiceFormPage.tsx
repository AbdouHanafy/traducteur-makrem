"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaPicker from "@/views/components/MediaPicker";
import { useI18n } from "@/views/components/I18nProvider";
import TranslationEditor from "@/views/components/TranslationEditor";
import type { TranslationsMap } from "@/lib/localize";

export interface ServiceFormValues {
  id?: string;
  slug: string;
  name: string;
  description: string;
  pricePerPage: string;
  imageUrl: string;
  active: boolean;
  translations: TranslationsMap;
}

export default function AdminServiceFormPage({ initial }: { initial: ServiceFormValues }) {
  const router = useRouter();
  const { t } = useI18n();
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
      setError(data?.error || t("adm.errorGeneric"));
      return;
    }

    router.push("/admin/services");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 py-14">
      <h1 className="mb-8 text-[26px] text-navy">{isEdit ? t("adm.serviceForm.titleEdit") : t("adm.serviceForm.titleNew")}</h1>

      <form onSubmit={onSubmit} className="grid gap-5 rounded-2xl border border-line bg-white p-7">
        {error && (
          <div className="rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[13.5px] text-danger">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.name")}</label>
          <input
            required
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({ ...f, name, slug: isEdit ? f.slug : slugify(name) }));
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
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.serviceForm.description")}</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            {t("adm.serviceForm.price")}
          </label>
          <input
            required
            type="number"
            min={0}
            step="0.001"
            value={form.pricePerPage}
            onChange={(e) => setForm((f) => ({ ...f, pricePerPage: e.target.value }))}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.serviceForm.photo")}</label>
          <MediaPicker value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
        </div>

        <TranslationEditor
          fields={[
            { name: "name", label: t("adm.name") },
            { name: "description", label: t("adm.serviceForm.description"), multiline: true },
          ]}
          base={{ name: form.name, description: form.description }}
          value={form.translations}
          onChange={(translations) => setForm((f) => ({ ...f, translations }))}
        />

        <label className="flex items-center gap-2.5 text-[14px] text-ink">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="h-4 w-4"
          />
          {t("adm.serviceForm.active")}
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
