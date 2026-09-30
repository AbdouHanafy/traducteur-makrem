"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/views/components/I18nProvider";
import TranslationEditor from "@/views/components/TranslationEditor";
import type { TranslationsMap } from "@/lib/localize";

export interface FaqValues {
  question: string;
  answer: string;
  active: boolean;
  translations: TranslationsMap;
}

export interface FaqRow extends FaqValues {
  id: string;
}

function FaqForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: FaqValues;
  onSubmit: (values: FaqValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const { t } = useI18n();
  const [question, setQuestion] = useState(initial.question);
  const [answer, setAnswer] = useState(initial.answer);
  const [active, setActive] = useState(initial.active);
  const [translations, setTranslations] = useState<TranslationsMap>(initial.translations);
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit({ question, answer, active, translations });
        setLoading(false);
      }}
      className="grid gap-3"
    >
      <input
        required
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={t("adm.faq.question")}
        className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
      />
      <textarea
        required
        rows={3}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={t("adm.faq.answer")}
        className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
      />
      <TranslationEditor
        fields={[
          { name: "question", label: t("adm.faq.question") },
          { name: "answer", label: t("adm.faq.answer"), multiline: true },
        ]}
        base={{ question, answer }}
        value={translations}
        onChange={setTranslations}
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13.5px] text-ink">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" />
          {t("adm.faq.published")}
        </label>
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="rounded-[9px] px-4 py-2 text-[13.5px] text-muted">
              {t("adm.cancel")}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-[9px] bg-blue px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-blue-2 disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function AdminFaqPage({ items }: { items: FaqRow[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function createFaq(values: FaqValues) {
    await fetch("/api/admin/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setAdding(false);
    router.refresh();
  }

  async function updateFaq(id: string, values: FaqValues) {
    await fetch(`/api/admin/faq/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setEditingId(null);
    router.refresh();
  }

  async function deleteFaq(id: string) {
    if (!confirm(t("adm.faq.deleteConfirm"))) return;
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function move(id: string, direction: "up" | "down") {
    await fetch(`/api/admin/faq/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[760px] px-6 py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] text-navy">{t("adm.faq.title")}</h1>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2"
          >
            {t("adm.faq.add")}
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-5 rounded-[14px] border border-line bg-white p-5">
          <FaqForm
            initial={{ question: "", answer: "", active: true, translations: {} }}
            onSubmit={createFaq}
            onCancel={() => setAdding(false)}
            submitLabel={t("adm.add")}
          />
        </div>
      )}

      <div className="grid gap-3">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-[14px] border border-line bg-white p-5">
            {editingId === item.id ? (
              <FaqForm
                initial={item}
                onSubmit={(values) => updateFaq(item.id, values)}
                onCancel={() => setEditingId(null)}
                submitLabel={t("adm.save")}
              />
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{item.question}</span>
                    {!item.active && (
                      <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-muted">
                        {t("adm.faq.unpublished")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13.5px] text-muted">{item.answer}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 border-t border-line pt-3 sm:border-t-0 sm:pt-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(item.id, "up")}
                    className="rounded-[7px] p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                    aria-label={t("adm.moveUp")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => move(item.id, "down")}
                    className="rounded-[7px] p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
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
                    onClick={() => deleteFaq(item.id)}
                    className="ml-1 text-[13px] font-semibold text-muted hover:text-[#9c2c2c]"
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
