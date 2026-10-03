"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LOCALE_OPTIONS, type Locale } from "@/lib/i18n";
import { EDIT_MESSAGE_TYPE, EDIT_QUERY_PARAM, stripMarkers } from "@/lib/i18n-edit";
import { useI18n } from "@/views/components/I18nProvider";

type LocaleValues = Record<Locale, Record<string, string>>;

/** Pages éditables : chemin public et clés SEO associées (titre / description Google). */
const PAGES = [
  { id: "home", path: "", seo: ["seo.home.description"] },
  { id: "services", path: "/services", seo: ["seo.services.title", "seo.services.description"] },
  { id: "about", path: "/a-propos", seo: ["seo.about.title", "seo.about.description"] },
  { id: "faq", path: "/faq", seo: ["seo.faq.title", "seo.faq.description"] },
  { id: "articles", path: "/articles", seo: ["seo.articles.title", "seo.articles.description"] },
  { id: "contact", path: "/contact", seo: ["seo.contact.title", "seo.contact.description"] },
  { id: "order", path: "/commander", seo: ["seo.order.title"] },
  { id: "login", path: "/login", seo: ["seo.login.title"] },
  { id: "register", path: "/register", seo: ["seo.register.title"] },
  { id: "notice", path: "/mentions-legales", seo: ["seo.notice.title", "seo.notice.description"] },
  { id: "terms", path: "/conditions-generales", seo: ["seo.terms.title", "seo.terms.description"] },
  { id: "privacy", path: "/confidentialite", seo: ["seo.privacy.title", "seo.privacy.description"] },
] as const;

const OTHER_CONTENT = [
  { href: "/admin/services", label: "adm.nav.services" },
  { href: "/admin/articles", label: "adm.nav.articles" },
  { href: "/admin/faq", label: "adm.nav.faq" },
  { href: "/admin/testimonials", label: "adm.nav.testimonials" },
  { href: "/admin/home-sections", label: "adm.nav.home" },
  { href: "/admin/partners", label: "adm.nav.partners" },
] as const;

const VARIABLE = /\{(\w+)\}/g;
const variablesOf = (text: string) => Array.from(new Set(Array.from(text.matchAll(VARIABLE), (match) => match[0])));

export default function AdminSiteEditor({ defaults, overrides: initialOverrides }: { defaults: LocaleValues; overrides: LocaleValues }) {
  const { t } = useI18n();
  const [locale, setLocale] = useState<Locale>("fr");
  const [pageId, setPageId] = useState<(typeof PAGES)[number]["id"]>("home");
  const [overrides, setOverrides] = useState(initialOverrides);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [undo, setUndo] = useState<{ key: string; locale: Locale; value: string | null } | null>(null);
  const [query, setQuery] = useState("");
  const [frameLoading, setFrameLoading] = useState(true);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const page = PAGES.find((item) => item.id === pageId) ?? PAGES[0];
  const previewSrc = `/${locale}${page.path}?${EDIT_QUERY_PARAM}=1`;
  const editable = defaults.fr;

  const original = useCallback((key: string, lang: Locale = locale) => defaults[lang][key] ?? defaults.fr[key] ?? "", [defaults, locale]);
  const current = useCallback((key: string, lang: Locale = locale) => overrides[lang][key] ?? original(key, lang), [overrides, original, locale]);

  const select = useCallback((key: string) => {
    if (!(key in editable)) {
      setSelectedKey(null);
      setNotice({ kind: "error", text: t("adm.edit.notEditable") });
      return;
    }
    setSelectedKey(key);
    setDraft(stripMarkers(overrides[locale][key] ?? defaults[locale][key] ?? defaults.fr[key] ?? ""));
    setNotice(null);
  }, [defaults, editable, locale, overrides, t]);

  // Clic sur un texte dans l'aperçu → l'éditeur ouvre ce texte.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.data?.type !== EDIT_MESSAGE_TYPE || typeof event.data.key !== "string") return;
      select(event.data.key);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [select]);

  const reloadPreview = useCallback(() => {
    setFrameLoading(true);
    frameRef.current?.contentWindow?.location.reload();
  }, []);

  async function persist(key: string, lang: Locale, value: string | null) {
    const response = await fetch("/api/admin/site-content/entry", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: lang, key, value }),
    });
    if (!response.ok) throw new Error("save");
    const data = await response.json();
    setOverrides((previous) => {
      const next = { ...previous[lang] };
      if (data.customized) next[key] = data.value; else delete next[key];
      return { ...previous, [lang]: next };
    });
    return data as { customized: boolean; value: string };
  }

  async function save(value: string | null, message: string) {
    if (!selectedKey) return;
    setBusy(true);
    setNotice(null);
    const previous = overrides[locale][selectedKey] ?? null;
    try {
      const result = await persist(selectedKey, locale, value);
      setUndo({ key: selectedKey, locale, value: previous });
      setDraft(result.value);
      setNotice({ kind: "ok", text: message });
      reloadPreview();
    } catch {
      setNotice({ kind: "error", text: t("adm.edit.errSave") });
    } finally {
      setBusy(false);
    }
  }

  async function undoLast() {
    if (!undo) return;
    setBusy(true);
    try {
      const result = await persist(undo.key, undo.locale, undo.value);
      if (undo.key === selectedKey && undo.locale === locale) setDraft(result.value);
      setUndo(null);
      setNotice({ kind: "ok", text: t("adm.edit.undone") });
      reloadPreview();
    } catch {
      setNotice({ kind: "error", text: t("adm.edit.errSave") });
    } finally {
      setBusy(false);
    }
  }

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (needle.length < 2) return [];
    return Object.keys(editable)
      .filter((key) => `${key} ${defaults.fr[key]} ${current(key)}`.toLocaleLowerCase().includes(needle))
      .slice(0, 12);
  }, [query, editable, defaults.fr, current]);

  const selectedOriginal = selectedKey ? original(selectedKey) : "";
  const isCustomized = selectedKey ? selectedKey in overrides[locale] : false;
  const changedDraft = selectedKey ? draft !== current(selectedKey) : false;
  const neededVars = variablesOf(selectedOriginal);
  const missingVars = neededVars.filter((variable) => !draft.includes(variable));
  const sectionOf = (key: string) => {
    const label = t(`adm.edit.section.${key.split(".")[0]}`);
    return label.startsWith("adm.edit.section.") ? key.split(".")[0] : label;
  };

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-edge bg-white p-4 shadow-[0_8px_28px_rgba(20,40,77,.04)] sm:p-5">
        <p className="max-w-3xl text-[13.5px] text-muted">{t("adm.edit.intro")}</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[auto_1fr]">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{t("adm.edit.step1")}</p>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("adm.edit.step1")}>
              {LOCALE_OPTIONS.map((option) => (
                <button key={option.value} type="button" role="tab" aria-selected={locale === option.value} onClick={() => { setLocale(option.value); setSelectedKey(null); setNotice(null); setFrameLoading(true); }} className={`rounded-xl px-4 py-2.5 text-[13px] font-semibold transition ${locale === option.value ? "bg-navy text-white shadow-sm" : "bg-mist text-muted hover:text-navy"}`}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{t("adm.edit.step2")}</p>
            <div className="flex flex-wrap gap-2">
              {PAGES.map((item) => (
                <button key={item.id} type="button" aria-pressed={pageId === item.id} onClick={() => { setPageId(item.id); setSelectedKey(null); setNotice(null); setFrameLoading(true); }} className={`rounded-xl px-3.5 py-2 text-[12.5px] font-semibold transition ${pageId === item.id ? "bg-blue text-white shadow-sm" : "bg-surface text-muted ring-1 ring-edge hover:text-navy"}`}>
                  {t(`adm.edit.page.${item.id}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section className="overflow-hidden rounded-2xl border border-edge bg-white shadow-[0_8px_28px_rgba(20,40,77,.04)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge bg-surface px-4 py-2.5">
            <span className="text-[12px] font-semibold text-navy">{t("adm.edit.step3")}</span>
            <span className="flex gap-3 text-[12px] font-semibold">
              <button type="button" onClick={reloadPreview} className="text-blue hover:text-blue-2">{t("adm.edit.refresh")}</button>
              <a href={`/${locale}${page.path}`} target="_blank" rel="noreferrer" className="text-muted hover:text-navy">{t("adm.edit.openSite")} ↗</a>
            </span>
          </div>
          <div className="relative">
            {frameLoading && <div className="absolute inset-0 z-10 grid place-items-center bg-white/80 text-[13px] text-muted">{t("adm.edit.previewLoading")}</div>}
            <iframe key={previewSrc} ref={frameRef} src={previewSrc} title={t("adm.edit.title")} onLoad={() => setFrameLoading(false)} className="h-[72vh] min-h-[520px] w-full bg-white" />
          </div>
        </section>

        <aside className="grid h-fit content-start gap-4 lg:sticky lg:top-[92px]">
          {notice && <div role="status" className={`rounded-xl border px-4 py-3 text-[13px] ${notice.kind === "ok" ? "border-ok/30 bg-ok-soft text-ok" : "border-danger-line bg-danger-soft text-danger"}`}>{notice.text}</div>}

          {selectedKey ? (
            <div className="rounded-2xl border border-blue/30 bg-white p-5 shadow-[0_8px_28px_rgba(20,40,77,.06)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{t("adm.edit.where")}</p>
              <p className="mt-1 text-[14px] font-semibold text-navy">{sectionOf(selectedKey)}</p>
              <p className="mt-0.5 font-mono text-[10.5px] text-muted">{selectedKey}</p>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                {isCustomized ? <span className="rounded-full bg-blue-soft px-2.5 py-1 text-blue-2">{t("adm.edit.customized")}</span> : <span className="rounded-full bg-mist px-2.5 py-1 text-muted">{t("adm.edit.isOriginal")}</span>}
                {changedDraft && <span className="rounded-full bg-caution-soft px-2.5 py-1 text-caution">{t("adm.edit.unsaved")}</span>}
              </div>

              <label htmlFor="site-editor-text" className="mt-4 block text-[13px] font-semibold text-ink">{t("adm.edit.yourText")} ({LOCALE_OPTIONS.find((o) => o.value === locale)?.label})</label>
              <textarea id="site-editor-text" dir={locale === "ar" ? "rtl" : "ltr"} rows={Math.min(12, Math.max(3, Math.ceil(draft.length / 38)))} value={draft} onChange={(event) => setDraft(event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-line bg-white px-3.5 py-3 text-[14.5px] leading-6 text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10" />
              <p className="mt-1 text-[11px] text-muted">{t("adm.edit.chars", { count: draft.length })}</p>

              {neededVars.length > 0 && <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-[11.5px] text-muted">{t("adm.edit.keepVars", { vars: neededVars.join(" ") })}</p>}
              {missingVars.length > 0 && <p className="mt-2 rounded-lg border border-caution-line bg-caution-soft px-3 py-2 text-[11.5px] text-caution">{t("adm.edit.missingVars", { vars: missingVars.join(" ") })}</p>}

              {locale !== "fr" && (
                <details className="mt-3 rounded-lg bg-surface px-3 py-2 text-[12px] text-muted">
                  <summary className="cursor-pointer font-semibold text-navy">{t("adm.edit.frenchRef")}</summary>
                  <p className="mt-2 whitespace-pre-line text-ink">{current(selectedKey, "fr")}</p>
                </details>
              )}
              {isCustomized && (
                <details className="mt-3 rounded-lg bg-surface px-3 py-2 text-[12px] text-muted">
                  <summary className="cursor-pointer font-semibold text-navy">{t("adm.edit.originalText")}</summary>
                  <p className="mt-2 whitespace-pre-line text-ink">{selectedOriginal}</p>
                </details>
              )}

              <div className="mt-4 grid gap-2">
                <button type="button" disabled={busy || !changedDraft || !draft.trim()} onClick={() => save(draft, t("adm.edit.saved"))} className="rounded-xl bg-blue px-5 py-3 text-[13.5px] font-semibold text-white shadow-[0_8px_22px_rgba(36,86,184,.2)] transition hover:bg-blue-2 disabled:cursor-not-allowed disabled:opacity-50">{busy ? t("adm.saving") : t("adm.edit.save")}</button>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-semibold">
                  {isCustomized && <button type="button" disabled={busy} onClick={() => save(null, t("adm.edit.restored"))} className="text-muted hover:text-danger">{t("adm.edit.restore")}</button>}
                  {undo && <button type="button" disabled={busy} onClick={undoLast} className="text-muted hover:text-navy">↶ {t("adm.edit.undo")}</button>}
                  <button type="button" onClick={() => { setSelectedKey(null); setNotice(null); }} className="text-muted hover:text-navy">{t("adm.edit.discard")}</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-white p-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-blue-soft text-blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m4 20 4-1 11-11a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></svg></div>
              <p className="font-semibold text-navy">{t("adm.edit.emptyTitle")}</p>
              <p className="mt-1 text-[12.5px] text-muted">{t("adm.edit.emptyHint")}</p>
              {undo && <button type="button" disabled={busy} onClick={undoLast} className="mt-3 text-[12px] font-semibold text-muted hover:text-navy">↶ {t("adm.edit.undo")}</button>}
            </div>
          )}

          {page.seo.length > 0 && (
            <div className="rounded-2xl border border-edge bg-white p-4">
              <p className="text-[12.5px] font-semibold text-navy">{t("adm.edit.seoTitle")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {page.seo.map((key) => (
                  <button key={key} type="button" onClick={() => select(key)} className={`rounded-lg px-3 py-2 text-[12px] font-semibold ring-1 transition ${selectedKey === key ? "bg-blue-soft text-blue-2 ring-blue/30" : "bg-surface text-muted ring-edge hover:text-navy"}`}>
                    {key.endsWith(".title") ? t("adm.edit.seoTitleBtn") : t("adm.edit.seoDescBtn")}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-edge bg-white p-4">
            <label htmlFor="site-editor-search" className="text-[12.5px] font-semibold text-navy">{t("adm.edit.searchLabel")}</label>
            <input id="site-editor-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("adm.edit.searchPlaceholder")} className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] outline-none focus:border-blue focus:bg-white" />
            {query.trim().length >= 2 && (
              <ul className="mt-2 grid max-h-64 gap-1 overflow-y-auto">
                {results.length === 0 && <li className="px-2 py-2 text-[12px] text-muted">{t("adm.edit.searchNone")}</li>}
                {results.map((key) => (
                  <li key={key}>
                    <button type="button" onClick={() => select(key)} className="w-full rounded-lg px-2.5 py-2 text-start transition hover:bg-blue-soft">
                      <span className="block text-[10.5px] font-semibold text-muted">{sectionOf(key)}</span>
                      <span dir={locale === "ar" ? "rtl" : "ltr"} className="block truncate text-[12.5px] text-ink">{current(key)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-edge bg-white p-4">
            <p className="text-[12.5px] font-semibold text-navy">{t("adm.edit.otherContentTitle")}</p>
            <p className="mt-1 text-[11.5px] text-muted">{t("adm.edit.otherContentHint")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {OTHER_CONTENT.map((item) => <Link key={item.href} href={item.href} className="rounded-lg bg-surface px-3 py-2 text-[12px] font-semibold text-blue ring-1 ring-edge transition hover:bg-blue-soft">{t(item.label)}</Link>)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
