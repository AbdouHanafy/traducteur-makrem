"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/views/components/I18nProvider";
import MediaPicker from "@/views/components/MediaPicker";
import TranslationEditor from "@/views/components/TranslationEditor";
import type { TranslationsMap } from "@/lib/localize";

export interface HomeSectionRow {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  isCustom: boolean;
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  translations: TranslationsMap;
}

interface CustomFormValues {
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  translations: TranslationsMap;
}

function CustomSectionForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: CustomFormValues;
  onSubmit: (values: CustomFormValues) => Promise<void>;
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
      <input
        value={values.eyebrow}
        onChange={(e) => setValues((v) => ({ ...v, eyebrow: e.target.value }))}
        placeholder={t("adm.home.eyebrow")}
        className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
      />
      <input
        required
        value={values.title}
        onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
        placeholder={t("adm.title")}
        className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
      />
      <textarea
        required
        rows={4}
        value={values.body}
        onChange={(e) => setValues((v) => ({ ...v, body: e.target.value }))}
        placeholder={t("adm.home.text")}
        className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
      />
      <div>
        <span className="mb-1.5 block text-[12.5px] font-semibold text-ink">
          {t("adm.home.image")}
        </span>
        <MediaPicker value={values.imageUrl} onChange={(url) => setValues((v) => ({ ...v, imageUrl: url }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          value={values.ctaLabel}
          onChange={(e) => setValues((v) => ({ ...v, ctaLabel: e.target.value }))}
          placeholder={t("adm.home.ctaLabel")}
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
        />
        <input
          value={values.ctaHref}
          onChange={(e) => setValues((v) => ({ ...v, ctaHref: e.target.value }))}
          placeholder={t("adm.home.ctaHref")}
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
        />
      </div>
      <TranslationEditor
        fields={[
          { name: "eyebrow", label: t("adm.home.eyebrow") },
          { name: "title", label: t("adm.title") },
          { name: "body", label: t("adm.home.text"), multiline: true, rows: 4 },
          { name: "ctaLabel", label: t("adm.home.ctaLabel") },
        ]}
        base={{ eyebrow: values.eyebrow, title: values.title, body: values.body, ctaLabel: values.ctaLabel }}
        value={values.translations}
        onChange={(translations) => setValues((v) => ({ ...v, translations }))}
      />
      <div className="flex justify-end gap-2">
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
    </form>
  );
}

const EMPTY_FORM: CustomFormValues = { eyebrow: "", title: "", body: "", imageUrl: "", ctaLabel: "", ctaHref: "", translations: {} };

export default function AdminHomeSectionsPage({ sections }: { sections: HomeSectionRow[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function createSection(values: CustomFormValues) {
    await fetch("/api/admin/home-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setAdding(false);
    router.refresh();
  }

  async function updateSection(id: string, values: CustomFormValues) {
    await fetch(`/api/admin/home-sections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setEditingId(null);
    router.refresh();
  }

  async function deleteSection(id: string) {
    if (!confirm(t("adm.home.deleteConfirm"))) return;
    await fetch(`/api/admin/home-sections/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function move(id: string, direction: "up" | "down") {
    await fetch(`/api/admin/home-sections/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    router.refresh();
  }

  async function toggleVisible(id: string, visible: boolean) {
    await fetch(`/api/admin/home-sections/${id}/visibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible }),
    });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[820px] px-6 py-14">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] text-navy sm:text-[26px]">{t("adm.home.title")}</h1>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2"
          >
            {t("adm.home.add")}
          </button>
        )}
      </div>
      <p className="mb-8 text-[13.5px] text-muted">
        {t("adm.home.note")}
      </p>

      {adding && (
        <div className="mb-5 rounded-2xl border border-line bg-white p-5">
          <CustomSectionForm
            initial={EMPTY_FORM}
            onSubmit={createSection}
            onCancel={() => setAdding(false)}
            submitLabel={t("adm.add")}
          />
        </div>
      )}

      <div className="grid gap-3">
        {sections.map((section, index) => (
          <div key={section.id} className="rounded-2xl border border-line bg-white p-5">
            {editingId === section.id ? (
              <CustomSectionForm
                initial={{
                  eyebrow: section.eyebrow,
                  title: section.title,
                  body: section.body,
                  imageUrl: section.imageUrl,
                  ctaLabel: section.ctaLabel,
                  ctaHref: section.ctaHref,
                  translations: section.translations,
                }}
                onSubmit={(values) => updateSection(section.id, values)}
                onCancel={() => setEditingId(null)}
                submitLabel={t("adm.save")}
              />
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${
                        section.isCustom ? "bg-blue-soft text-blue-2" : "bg-mist text-muted"
                      }`}
                    >
                      {section.isCustom ? t("adm.home.custom") : t("adm.home.system")}
                    </span>
                    <span className="font-semibold text-ink">
                      {section.isCustom ? section.title || t("adm.home.untitled") : t(`adm.home.sectionLabel.${section.type}`)}
                    </span>
                    {!section.visible && (
                      <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-muted">
                        {t("adm.hiddenF")}
                      </span>
                    )}
                  </div>
                  {section.isCustom && section.body && (
                    <p className="mt-1.5 max-w-[52ch] truncate text-[13.5px] text-muted">{section.body}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1 border-t border-line pt-3 sm:border-t-0 sm:pt-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(section.id, "up")}
                    className="rounded-md p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                    aria-label={t("adm.moveUp")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === sections.length - 1}
                    onClick={() => move(section.id, "down")}
                    className="rounded-md p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                    aria-label={t("adm.moveDown")}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleVisible(section.id, !section.visible)}
                    className="ml-2 text-[13px] font-semibold text-muted hover:text-navy"
                  >
                    {section.visible ? t("adm.hide") : t("adm.show")}
                  </button>
                  {section.isCustom && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingId(section.id)}
                        className="ml-1 text-[13px] font-semibold text-blue hover:text-blue-2"
                      >
                        {t("adm.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSection(section.id)}
                        className="ml-1 text-[13px] font-semibold text-muted hover:text-danger"
                      >
                        {t("adm.delete")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
