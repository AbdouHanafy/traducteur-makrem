"use client";

import { useState } from "react";
import { LOCALE_OPTIONS } from "@/lib/i18n";
import { useI18n } from "@/views/components/I18nProvider";
import { TRANSLATION_LOCALES, type TranslationLocale, type TranslationsMap } from "@/lib/localize";

export interface TranslationFieldDef {
  name: string;
  label: string;
  multiline?: boolean;
  rows?: number;
}

const inputClass = "w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[14.5px] text-ink outline-none focus:border-blue";

/**
 * Saisie des traductions (ar / en / it) d'un contenu. Le français est la langue de base
 * (champs principaux du formulaire) ; un champ laissé vide retombe automatiquement sur le
 * français côté site public.
 */
export default function TranslationEditor({ fields, base, value, onChange }: {
  fields: TranslationFieldDef[];
  base: Record<string, string | null | undefined>;
  value: TranslationsMap;
  onChange: (next: TranslationsMap) => void;
}) {
  const { t } = useI18n();
  const [active, setActive] = useState<TranslationLocale>("ar");

  function filledCount(locale: TranslationLocale) {
    return fields.filter((field) => value[locale]?.[field.name]?.trim()).length;
  }

  function update(locale: TranslationLocale, name: string, text: string) {
    onChange({ ...value, [locale]: { ...value[locale], [name]: text } });
  }

  return (
    <fieldset className="grid gap-4 rounded-[12px] border border-line bg-[#fafbfc] p-4">
      <legend className="px-2 text-[13px] font-semibold text-navy">{t("adm.tr.legend")}</legend>
      <p className="-mt-1 text-[12px] text-muted">{t("adm.tr.hint")}</p>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("adm.tr.tabs")}>
        {TRANSLATION_LOCALES.map((locale) => {
          const option = LOCALE_OPTIONS.find((item) => item.value === locale)!;
          const filled = filledCount(locale);
          return (
            <button key={locale} type="button" role="tab" aria-selected={active === locale} onClick={() => setActive(locale)} className={`rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition ${active === locale ? "bg-navy text-white" : "bg-white text-muted ring-1 ring-line hover:text-navy"}`}>
              {option.label}
              <span className={`ms-2 rounded-full px-1.5 py-0.5 text-[10px] ${filled === fields.length ? "bg-ok-soft text-ok" : "bg-mist text-muted"}`}>{filled}/{fields.length}</span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-4" dir={active === "ar" ? "rtl" : "ltr"}>
        {fields.map((field) => {
          const id = `tr-${active}-${field.name}`;
          const text = value[active]?.[field.name] ?? "";
          return (
            <div key={field.name}>
              <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink">{field.label}</label>
              {field.multiline ? (
                <textarea id={id} rows={field.rows ?? 3} value={text} placeholder={base[field.name] ?? ""} onChange={(event) => update(active, field.name, event.target.value)} className={inputClass} />
              ) : (
                <input id={id} value={text} placeholder={base[field.name] ?? ""} onChange={(event) => update(active, field.name, event.target.value)} className={inputClass} />
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
