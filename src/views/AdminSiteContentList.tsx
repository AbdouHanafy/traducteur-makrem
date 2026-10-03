"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_OPTIONS, LOCALES, type Locale } from "@/lib/i18n";
import MediaPicker from "@/views/components/MediaPicker";
import { useI18n } from "@/views/components/I18nProvider";

interface ContentGroup {
  id: string;
  label: string;
  description: string;
  keys: string[];
}

type LocaleValues = Record<Locale, Record<string, string>>;

function fieldTitle(key: string) {
  const name = key.split(".").at(-1) ?? key;
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export default function AdminSiteContentList({ groups, defaults, overrides }: {
  groups: ContentGroup[];
  defaults: LocaleValues;
  overrides: LocaleValues;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [locale, setLocale] = useState<Locale>("fr");
  const [activeGroup, setActiveGroup] = useState(groups[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [values, setValues] = useState<LocaleValues>(() => Object.fromEntries(
    LOCALES.map((item) => [item, { ...defaults[item], ...overrides[item] }]),
  ) as LocaleValues);

  const group = groups.find((item) => item.id === activeGroup) ?? groups[0];
  const visibleKeys = useMemo(() => {
    if (!group) return [];
    const normalized = query.trim().toLocaleLowerCase("fr");
    if (!normalized) return group.keys;
    return group.keys.filter((key) =>
      `${key} ${defaults.fr[key] ?? ""} ${values[locale][key] ?? ""}`.toLocaleLowerCase("fr").includes(normalized),
    );
  }, [defaults, group, locale, query, values]);

  const customizedCount = Object.keys(overrides[locale]).length;

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, values: values[locale] }),
      });
      if (!response.ok) throw new Error(t("adm.content.errSave"));
      setMessage(t("adm.content.saved"));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("adm.errorGeneric"));
    } finally {
      setSaving(false);
    }
  }

  function resetGroup() {
    if (!group || !confirm(t("adm.content.resetConfirm", { label: t(`adm.content.group.${group.id}`) }))) return;
    setValues((current) => ({
      ...current,
      [locale]: {
        ...current[locale],
        ...Object.fromEntries(group.keys.map((key) => [key, defaults[locale][key] ?? ""])),
      },
    }));
    setMessage(t("adm.content.resetDone"));
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">{t("adm.content.eyebrow")}</p>
          <h1 className="text-[25px] text-navy sm:text-[30px]">{t("adm.content.title")}</h1>
          <p className="mt-2 max-w-2xl text-[13.5px] text-muted">{t("adm.content.intro")}</p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue px-6 py-3 text-[13.5px] font-semibold text-white shadow-[0_8px_22px_rgba(36,86,184,.2)] transition hover:bg-blue-2 disabled:cursor-wait disabled:opacity-60">
          {saving ? t("adm.saving") : t("adm.content.publish")}
        </button>
      </div>

      <div className="mb-5 rounded-2xl border border-line bg-white p-3 shadow-[0_8px_28px_rgba(20,40,77,.04)] sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("adm.content.langLabel")}>
            {LOCALE_OPTIONS.map((option) => (
              <button key={option.value} type="button" role="tab" aria-selected={locale === option.value} onClick={() => { setLocale(option.value); setMessage(""); }} className={`rounded-xl px-4 py-2.5 text-[12.5px] font-semibold transition ${locale === option.value ? "bg-navy text-white shadow-sm" : "bg-mist text-muted hover:text-navy"}`}>
                {option.shortLabel} <span className="ms-1 hidden sm:inline">{option.label}</span>
              </button>
            ))}
          </div>
          <span className="text-[11.5px] text-muted">{t(customizedCount === 1 ? "adm.content.customOne" : "adm.content.customMany", { count: customizedCount })}</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-line bg-white p-2 shadow-[0_8px_28px_rgba(20,40,77,.04)] lg:sticky lg:top-[92px]">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {groups.map((item) => (
              <button key={item.id} type="button" onClick={() => { setActiveGroup(item.id); setQuery(""); }} className={`rounded-xl px-3 py-3 text-start text-[12.5px] font-semibold transition ${activeGroup === item.id ? "bg-blue-soft text-blue-2" : "text-muted hover:bg-mist hover:text-navy"}`}>
                {t(`adm.content.group.${item.id}`)}
                <span className="mt-0.5 hidden text-[10.5px] font-normal opacity-75 lg:block">{t("adm.content.fields", { count: item.keys.length })}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 rounded-2xl border border-line bg-white shadow-[0_8px_28px_rgba(20,40,77,.04)]">
          <div className="border-b border-line p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div><h2 className="text-[19px] text-navy">{group ? t(`adm.content.group.${group.id}`) : ""}</h2><p className="mt-1 text-[12.5px] text-muted">{group ? t(`adm.content.group.${group.id}Desc`) : ""}</p></div>
              <button type="button" onClick={resetGroup} className="shrink-0 text-start text-[12px] font-semibold text-muted hover:text-blue">{t("adm.content.resetGroup")}</button>
            </div>
            <div className="relative mt-4">
              <svg aria-hidden="true" className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("adm.content.search")} className="h-11 w-full rounded-xl border border-line bg-surface ps-10 pe-4 text-[13px] text-ink outline-none transition focus:border-blue focus:bg-white" />
            </div>
          </div>

          <div className="grid gap-0 divide-y divide-line">
            {visibleKeys.map((key) => {
              const value = values[locale][key] ?? "";
              const isLong = value.length > 100 || value.includes("\n") || key.endsWith("description") || key.endsWith("Desc") || key.endsWith("Subtitle");
              const customized = value !== defaults[locale][key];
              const inputClass = "mt-2 w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13.5px] text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10";
              return (
                <div key={key} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <label htmlFor={`content-${key}`} className="text-[13px] font-semibold text-navy">{fieldTitle(key)}</label>
                    <span className="flex items-center gap-2"><code className="text-[10px] text-slate-400">{key}</code>{customized && <span className="rounded-full bg-blue-soft px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-blue">{t("adm.content.modified")}</span>}</span>
                  </div>
                  {locale !== "fr" && <p className="mt-1 text-[11px] text-slate-400">{t("adm.content.reference", { text: defaults.fr[key] })}</p>}
                  {key.endsWith("Url") ? (
                    <div className="mt-2"><MediaPicker value={value} onChange={(url) => setValues((current) => ({ ...current, [locale]: { ...current[locale], [key]: url } }))} /></div>
                  ) : isLong ? (
                    <textarea id={`content-${key}`} rows={4} value={value} onChange={(event) => setValues((current) => ({ ...current, [locale]: { ...current[locale], [key]: event.target.value } }))} className={`${inputClass} resize-y`} />
                  ) : (
                    <input id={`content-${key}`} value={value} onChange={(event) => setValues((current) => ({ ...current, [locale]: { ...current[locale], [key]: event.target.value } }))} className={inputClass} />
                  )}
                </div>
              );
            })}
            {visibleKeys.length === 0 && <div className="p-10 text-center text-[13px] text-muted">{t("adm.content.noMatch")}</div>}
          </div>
        </section>
      </div>

      <div className="sticky bottom-3 z-20 mt-5 flex flex-col gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-[0_16px_45px_rgba(20,40,77,.14)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className={`px-2 text-[12px] ${message.startsWith("Impossible") || message.startsWith("Une erreur") ? "text-red-600" : "text-muted"}`}>{message || t("adm.content.footerHint")}</p>
        <button type="button" onClick={save} disabled={saving} className="shrink-0 rounded-xl bg-blue px-5 py-2.5 text-[12.5px] font-semibold text-white hover:bg-blue-2 disabled:opacity-60">{saving ? t("adm.saving") : t("adm.content.publish")}</button>
      </div>
    </div>
  );
}
