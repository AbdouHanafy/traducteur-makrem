"use client";

import { createContext, useContext, useMemo } from "react";
import { translate, type Locale, type TranslationKey } from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  isRtl: boolean;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export default function I18nProvider({ locale, overrides = {}, children }: { locale: Locale; overrides?: Record<string, string>; children: React.ReactNode }) {
  const value = useMemo<I18nContextValue>(
    () => ({ locale, isRtl: locale === "ar", t: (key, values) => translate(locale, key, values, overrides) }),
    [locale, overrides],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
