"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_OPTIONS, type Locale } from "@/lib/i18n";
import { useI18n } from "@/views/components/I18nProvider";

export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [pending, setPending] = useState(false);

  async function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;
    setPending(true);
    const response = await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });
    if (response.ok) router.refresh();
    setPending(false);
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("language.label")}</span>
      <svg aria-hidden="true" className={`pointer-events-none absolute start-2.5 h-3.5 w-3.5 ${dark ? "text-slate-300" : "text-muted"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
      <select
        aria-label={t("language.label")}
        value={locale}
        disabled={pending}
        onChange={(event) => changeLocale(event.target.value as Locale)}
        className={`h-9 appearance-none rounded-lg border py-0 ps-8 pe-7 text-[11px] font-bold outline-none transition ${
          dark ? "border-white/15 bg-white/10 text-white" : "border-line bg-white text-navy hover:border-blue/30"
        } disabled:opacity-60`}
      >
        {LOCALE_OPTIONS.map((option) => <option key={option.value} value={option.value} className="text-navy">{option.shortLabel}</option>)}
      </select>
      <svg aria-hidden="true" className={`pointer-events-none absolute end-2 h-3 w-3 ${dark ? "text-slate-300" : "text-muted"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
    </label>
  );
}
