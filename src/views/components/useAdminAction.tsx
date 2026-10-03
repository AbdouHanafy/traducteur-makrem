"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useI18n } from "@/views/components/I18nProvider";

/** Message lisible à partir d'une réponse d'erreur de l'API (champ `error` + détails de validation). */
export function describeApiError(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const { error, issues } = data as { error?: unknown; issues?: Record<string, string[] | undefined> };
  const details = issues ? Object.values(issues).flat().filter((message): message is string => typeof message === "string" && message.length > 0) : [];
  const base = typeof error === "string" && error ? error : fallback;
  return details.length > 0 ? `${base} ${details.join(" ")}` : base;
}

/**
 * Exécute une action d'administration (requête API) et n'annonce le succès que si le serveur l'a
 * acceptée : en cas d'échec (validation, droits, conflit, réseau) l'erreur reste affichée et
 * l'écran ne se ferme pas comme si l'enregistrement avait réussi.
 */
export function useAdminAction() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (request: () => Promise<Response>, onSuccess?: () => void): Promise<boolean> => {
      setPending(true);
      setError(null);
      try {
        const response = await request();
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(describeApiError(data, t("adm.errorGeneric")));
          return false;
        }
        onSuccess?.();
        router.refresh();
        return true;
      } catch {
        setError(t("adm.errorNetwork"));
        return false;
      } finally {
        setPending(false);
      }
    },
    [router, t],
  );

  const banner = error ? (
    <div role="alert" className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <span>{error}</span>
      <button type="button" onClick={() => setError(null)} aria-label={t("adm.picker.close")} className="shrink-0 font-bold leading-none">×</button>
    </div>
  ) : null;

  return { run, pending, error, banner, clearError: () => setError(null) };
}

/** Requête JSON (méthode + corps) prête à passer à `run`. */
export function jsonRequest(url: string, method: string, body?: unknown): () => Promise<Response> {
  return () =>
    fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
}
