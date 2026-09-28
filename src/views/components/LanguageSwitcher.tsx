"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_OPTIONS, type Locale } from "@/lib/i18n";
import { useI18n } from "@/views/components/I18nProvider";

function FlagIcon({ locale }: { locale: Locale }) {
  const commonProps = {
    "aria-hidden": true,
    className: "h-4 w-6 shrink-0 overflow-hidden rounded-[3px] border border-black/10 shadow-sm",
    viewBox: "0 0 24 16",
  } as const;

  if (locale === "fr") {
    return (
      <svg {...commonProps}>
        <path fill="#1d3f91" d="M0 0h8v16H0z" />
        <path fill="#fff" d="M8 0h8v16H8z" />
        <path fill="#e13b43" d="M16 0h8v16h-8z" />
      </svg>
    );
  }

  if (locale === "it") {
    return (
      <svg {...commonProps}>
        <path fill="#159447" d="M0 0h8v16H0z" />
        <path fill="#fff" d="M8 0h8v16H8z" />
        <path fill="#d9323e" d="M16 0h8v16h-8z" />
      </svg>
    );
  }

  if (locale === "ar") {
    return (
      <svg {...commonProps}>
        <path fill="#e70013" d="M0 0h24v16H0z" />
        <circle cx="12" cy="8" r="4.2" fill="#fff" />
        <circle cx="12.8" cy="8" r="2.65" fill="#e70013" />
        <circle cx="13.65" cy="8" r="2.15" fill="#fff" />
        <path fill="#e70013" d="m13.45 8 1.92-.62-1.19 1.64V6.98l1.19 1.64z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path fill="#173f8a" d="M0 0h24v16H0z" />
      <path stroke="#fff" strokeWidth="3.2" d="m0 0 24 16M24 0 0 16" />
      <path stroke="#d7283f" strokeWidth="1.5" d="m0 0 24 16M24 0 0 16" />
      <path fill="#fff" d="M10 0h4v16h-4zM0 6h24v4H0z" />
      <path fill="#d7283f" d="M11 0h2v16h-2zM0 7h24v2H0z" />
    </svg>
  );
}

export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeOption = LOCALE_OPTIONS.find((option) => option.value === locale) ?? LOCALE_OPTIONS[0];

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function changeLocale(nextLocale: Locale) {
    setOpen(false);
    if (nextLocale === locale) return;

    try {
      setPending(true);
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
      if (response.ok) router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div ref={containerRef} className="relative inline-flex" dir="ltr">
      <button
        type="button"
        aria-label={t("language.label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={pending}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-blue/30 ${
          dark
            ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
            : "border-line bg-white text-navy shadow-sm hover:border-blue/30 hover:bg-slate-50"
        } disabled:cursor-wait disabled:opacity-60`}
      >
        <FlagIcon locale={activeOption.value} />
        <span>{activeOption.shortLabel}</span>
        <svg
          aria-hidden="true"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""} ${dark ? "text-slate-300" : "text-muted"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("language.label")}
          className="absolute end-0 top-full z-[80] mt-2 min-w-40 overflow-hidden rounded-xl border border-line bg-white p-1.5 text-navy shadow-xl shadow-navy/10"
        >
          {LOCALE_OPTIONS.map((option) => {
            const selected = option.value === locale;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => changeLocale(option.value)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-xs font-semibold transition ${
                  selected ? "bg-blue/10 text-blue" : "hover:bg-slate-100"
                }`}
              >
                <FlagIcon locale={option.value} />
                <span className="flex-1">{option.label}</span>
                {selected && (
                  <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
