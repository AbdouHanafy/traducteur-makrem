"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaPicker from "@/views/components/MediaPicker";

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
}

interface CustomFormValues {
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
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
        placeholder="Sur-titre (optionnel)"
        className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
      />
      <input
        required
        value={values.title}
        onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
        placeholder="Titre"
        className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
      />
      <textarea
        required
        rows={4}
        value={values.body}
        onChange={(e) => setValues((v) => ({ ...v, body: e.target.value }))}
        placeholder="Texte"
        className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
      />
      <div>
        <span className="mb-1.5 block text-[12.5px] font-semibold text-ink">
          Image (optionnelle — la section passe en deux colonnes si présente)
        </span>
        <MediaPicker value={values.imageUrl} onChange={(url) => setValues((v) => ({ ...v, imageUrl: url }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          value={values.ctaLabel}
          onChange={(e) => setValues((v) => ({ ...v, ctaLabel: e.target.value }))}
          placeholder="Bouton — libellé"
          className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
        />
        <input
          value={values.ctaHref}
          onChange={(e) => setValues((v) => ({ ...v, ctaHref: e.target.value }))}
          placeholder="Bouton — lien (/contact, /commander...)"
          className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-[9px] px-4 py-2 text-[13.5px] text-muted">
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-[9px] bg-blue px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-blue-2 disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

const EMPTY_FORM: CustomFormValues = { eyebrow: "", title: "", body: "", imageUrl: "", ctaLabel: "", ctaHref: "" };

export default function AdminHomeSectionsPage({ sections }: { sections: HomeSectionRow[] }) {
  const router = useRouter();
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
    if (!confirm("Supprimer cette section ?")) return;
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
        <h1 className="text-[22px] text-navy sm:text-[26px]">Sections de la page d&apos;accueil</h1>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2"
          >
            Ajouter une section
          </button>
        )}
      </div>
      <p className="mb-8 text-[13.5px] text-muted">
        Les sections système (en-tête, prestations, etc.) gardent leur mise en page ; vous
        pouvez les réordonner et les masquer. Une section personnalisée peut être ajoutée,
        éditée et positionnée n&apos;importe où.
      </p>

      {adding && (
        <div className="mb-5 rounded-[14px] border border-line bg-white p-5">
          <CustomSectionForm
            initial={EMPTY_FORM}
            onSubmit={createSection}
            onCancel={() => setAdding(false)}
            submitLabel="Ajouter"
          />
        </div>
      )}

      <div className="grid gap-3">
        {sections.map((section, index) => (
          <div key={section.id} className="rounded-[14px] border border-line bg-white p-5">
            {editingId === section.id ? (
              <CustomSectionForm
                initial={{
                  eyebrow: section.eyebrow,
                  title: section.title,
                  body: section.body,
                  imageUrl: section.imageUrl,
                  ctaLabel: section.ctaLabel,
                  ctaHref: section.ctaHref,
                }}
                onSubmit={(values) => updateSection(section.id, values)}
                onCancel={() => setEditingId(null)}
                submitLabel="Enregistrer"
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
                      {section.isCustom ? "Personnalisée" : "Système"}
                    </span>
                    <span className="font-semibold text-ink">
                      {section.isCustom ? section.title || "(sans titre)" : section.label}
                    </span>
                    {!section.visible && (
                      <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-muted">
                        Masquée
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
                    className="rounded-[7px] p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                    aria-label="Monter"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === sections.length - 1}
                    onClick={() => move(section.id, "down")}
                    className="rounded-[7px] p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                    aria-label="Descendre"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleVisible(section.id, !section.visible)}
                    className="ml-2 text-[13px] font-semibold text-muted hover:text-navy"
                  >
                    {section.visible ? "Masquer" : "Afficher"}
                  </button>
                  {section.isCustom && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingId(section.id)}
                        className="ml-1 text-[13px] font-semibold text-blue hover:text-blue-2"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSection(section.id)}
                        className="ml-1 text-[13px] font-semibold text-muted hover:text-[#9c2c2c]"
                      >
                        Supprimer
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
