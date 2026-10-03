"use client";

import { useState } from "react";
import { jsonRequest, useAdminAction } from "@/views/components/useAdminAction";
import { useI18n } from "@/views/components/I18nProvider";
import TranslationEditor from "@/views/components/TranslationEditor";
import type { TranslationsMap } from "@/lib/localize";

export interface TestimonialRow {
  id: string;
  authorName: string;
  authorRole: string;
  quote: string;
  rating: number | null;
  active: boolean;
  translations: TranslationsMap;
}

interface FormValues {
  authorName: string;
  authorRole: string;
  quote: string;
  rating: number;
  active: boolean;
  translations: TranslationsMap;
}

function Stars({ value }: { value: number | null }) {
  const { t } = useI18n();
  if (!value) return null;
  return (
    <span className="text-seal" aria-label={t("adm.testimonials.ratingOf", { n: value })}>
      {"★".repeat(value)}
      <span className="text-line">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function TestimonialForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState(initial);
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(values);
        setLoading(false);
      }}
      className="grid gap-3"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          required
          value={values.authorName}
          onChange={(e) => setValues((v) => ({ ...v, authorName: e.target.value }))}
          placeholder={t("adm.testimonials.authorName")}
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
        />
        <input
          value={values.authorRole}
          onChange={(e) => setValues((v) => ({ ...v, authorRole: e.target.value }))}
          placeholder={t("adm.testimonials.context")}
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
        />
      </div>
      <textarea
        required
        rows={3}
        value={values.quote}
        onChange={(e) => setValues((v) => ({ ...v, quote: e.target.value }))}
        placeholder={t("adm.testimonials.quote")}
        className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
      />
      <TranslationEditor
        fields={[
          { name: "authorRole", label: t("adm.testimonials.context") },
          { name: "quote", label: t("adm.testimonials.quote"), multiline: true },
        ]}
        base={{ authorRole: values.authorRole, quote: values.quote }}
        value={values.translations}
        onChange={(translations) => setValues((v) => ({ ...v, translations }))}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-[13.5px] text-ink">{t("adm.testimonials.rating")}</label>
          <select
            value={values.rating}
            onChange={(e) => setValues((v) => ({ ...v, rating: Number(e.target.value) }))}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-[13.5px] text-ink outline-none focus:border-blue"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} / 5
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-[13.5px] text-ink">
            <input type="checkbox" checked={values.active} onChange={(e) => setValues((v) => ({ ...v, active: e.target.checked }))} className="h-4 w-4" />
            {t("adm.published")}
          </label>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-[13.5px] text-muted">
            {t("adm.cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-blue-2 disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

const EMPTY_FORM: FormValues = { authorName: "", authorRole: "", quote: "", rating: 5, active: true, translations: {} };

export default function AdminTestimonialsPage({ items }: { items: TestimonialRow[] }) {
  const { t } = useI18n();
  const { run, banner } = useAdminAction();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function create(values: FormValues) {
    await run(jsonRequest("/api/admin/testimonials", "POST", values), () => setAdding(false));
  }

  async function update(id: string, values: FormValues) {
    await run(jsonRequest(`/api/admin/testimonials/${id}`, "PATCH", values), () => setEditingId(null));
  }

  async function remove(id: string) {
    if (!confirm(t("adm.testimonials.deleteConfirm"))) return;
    await run(jsonRequest(`/api/admin/testimonials/${id}`, "DELETE"));
  }

  async function move(id: string, direction: "up" | "down") {
    await run(jsonRequest(`/api/admin/testimonials/${id}/move`, "POST", { direction }));
  }

  return (
    <div className="mx-auto max-w-[820px] px-6 py-14">
      {banner}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] text-navy sm:text-[26px]">{t("adm.testimonials.title")}</h1>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2"
          >
            {t("adm.testimonials.add")}
          </button>
        )}
      </div>
      <p className="mb-8 text-[13.5px] text-muted">
        {t("adm.testimonials.note")}
      </p>

      {adding && (
        <div className="mb-5 rounded-2xl border border-line bg-white p-5">
          <TestimonialForm initial={EMPTY_FORM} onSubmit={create} onCancel={() => setAdding(false)} submitLabel={t("adm.add")} />
        </div>
      )}

      {items.length === 0 && !adding && (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-muted">
          {t("adm.testimonials.empty")}
        </div>
      )}

      <div className="grid gap-3">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-line bg-white p-5">
            {editingId === item.id ? (
              <TestimonialForm
                initial={{
                  authorName: item.authorName,
                  authorRole: item.authorRole,
                  quote: item.quote,
                  rating: item.rating ?? 5,
                  active: item.active,
                  translations: item.translations,
                }}
                onSubmit={(values) => update(item.id, values)}
                onCancel={() => setEditingId(null)}
                submitLabel={t("adm.save")}
              />
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{item.authorName}</span>
                    {item.authorRole && <span className="text-[12.5px] text-muted">— {item.authorRole}</span>}
                    <Stars value={item.rating} />
                    {!item.active && (
                      <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-muted">
                        {t("adm.unpublished")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13.5px] text-muted">&laquo; {item.quote} &raquo;</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 border-t border-line pt-3 sm:border-t-0 sm:pt-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(item.id, "up")}
                    className="rounded-md p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                    aria-label={t("adm.moveUp")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => move(item.id, "down")}
                    className="rounded-md p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                    aria-label={t("adm.moveDown")}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(item.id)}
                    className="ml-2 text-[13px] font-semibold text-blue hover:text-blue-2"
                  >
                    {t("adm.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="ml-1 text-[13px] font-semibold text-muted hover:text-danger"
                  >
                    {t("adm.delete")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
