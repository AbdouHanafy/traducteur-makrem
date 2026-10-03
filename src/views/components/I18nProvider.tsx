"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { translate, type Locale, type TranslationKey } from "@/lib/i18n";
import { EDIT_QUERY_PARAM, encodeKey, isMarkable } from "@/lib/i18n-edit";
import EditOverlay from "@/views/components/EditOverlay";

interface I18nContextValue {
  locale: Locale;
  isRtl: boolean;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Mode édition : uniquement dans l'aperçu du backoffice (page ouverte dans une iframe de la même
 * origine avec ?__edit=1). Activé après l'hydratation, donc sans écart avec le HTML statique servi
 * aux visiteurs, qui ne contient jamais de signature.
 */
function readEditMode(): boolean {
  try {
    const inFrame = window.parent !== window;
    const requested = new URLSearchParams(window.location.search).has(EDIT_QUERY_PARAM);
    // Accès à window.parent.location : lève une exception si le parent est d'une autre origine.
    return requested && inFrame && Boolean(window.parent.location.href);
  } catch {
    return false;
  }
}

const noopSubscribe = () => () => {};

function useEditMode(): boolean {
  // Serveur / hydratation : false (HTML identique pour tous). Navigateur : valeur réelle juste après.
  return useSyncExternalStore(noopSubscribe, readEditMode, () => false);
}

export default function I18nProvider({ locale, overrides = {}, children }: { locale: Locale; overrides?: Record<string, string>; children: React.ReactNode }) {
  const editMode = useEditMode();
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      isRtl: locale === "ar",
      t: (key, values) => {
        const text = translate(locale, key, values, overrides);
        return editMode && isMarkable(key, text) ? text + encodeKey(key) : text;
      },
    }),
    [locale, overrides, editMode],
  );
  return (
    <I18nContext.Provider value={value}>
      {children}
      {editMode && <EditOverlay />}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
