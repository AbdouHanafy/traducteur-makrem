"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/views/components/I18nProvider";

type State = "loading" | "ready" | "unavailable";

/**
 * Aperçu de contrôle de la traduction, avant paiement : pages JPEG basse résolution, filigrane en mosaïque
 * incrusté côté serveur, jamais le fichier réel. Aucune action de téléchargement n'est proposée.
 */
export default function ProtectedPreview({
  orderId,
  documentId,
  onViewed,
  onUnavailable,
}: {
  orderId: string;
  documentId: string;
  onViewed: () => void;
  onUnavailable: () => void;
}) {
  const { t } = useI18n();
  const base = `/api/orders/${orderId}/documents/${documentId}/client-preview`;
  const [state, setState] = useState<State>("loading");
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    fetch(`${base}?meta=1`, { cache: "no-store" })
      .then(async (res) => {
        if (!active) return;
        if (!res.ok) throw new Error("unavailable");
        const data = (await res.json()) as { pageCount: number };
        setPageCount(data.pageCount);
        setState("ready");
      })
      .catch(() => {
        if (!active) return;
        setState("unavailable");
        onUnavailable();
      });
    return () => {
      active = false;
    };
  }, [base, onUnavailable]);

  if (state === "loading") return <div role="status" className="h-64 animate-pulse rounded-2xl bg-mist" aria-label={t("app.preview.loading")} />;
  if (state === "unavailable") return <p className="rounded-xl border border-caution-line bg-caution-soft px-4 py-3 text-[13px] text-caution">{t("app.preview.unavailable")}</p>;

  return (
    <div className="overflow-hidden rounded-2xl border border-edge bg-surface" onContextMenu={(event) => event.preventDefault()}>
      <div className="flex items-center justify-between gap-2 border-b border-edge bg-white px-4 py-2.5 text-[12px] text-muted">
        <span className="rounded-full bg-caution-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[.08em] text-caution">{t("app.preview.badge")}</span>
        {pageCount > 1 && (
          <span className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-line px-2.5 py-1 font-semibold text-navy disabled:opacity-40" aria-label={t("app.preview.prev")}>‹</button>
            <span aria-live="polite">{t("app.preview.pageOf", { page, total: pageCount })}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="rounded-lg border border-line px-2.5 py-1 font-semibold text-navy disabled:opacity-40" aria-label={t("app.preview.next")}>›</button>
          </span>
        )}
      </div>
      <div className="max-h-[680px] select-none overflow-auto p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={page}
          src={`${base}?page=${page}`}
          alt={t("app.preview.alt", { page })}
          draggable={false}
          onLoad={onViewed}
          onError={() => { setState("unavailable"); onUnavailable(); }}
          className="mx-auto h-auto w-full max-w-[760px] select-none rounded-md bg-white shadow-[0_6px_20px_rgba(20,40,77,0.12)] [-webkit-user-drag:none]"
        />
      </div>
      <p className="border-t border-edge bg-white px-4 py-3 text-[11.5px] leading-5 text-muted">{t("app.preview.notice")}</p>
    </div>
  );
}
