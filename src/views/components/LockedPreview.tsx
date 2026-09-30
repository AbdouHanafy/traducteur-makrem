"use client";

import { useI18n } from "@/views/components/I18nProvider";

/**
 * État volontairement sans aperçu : avant confirmation serveur du solde, aucun octet du
 * document traduit (ni PDF, ni image de page) n'est envoyé au navigateur du client.
 */
export default function LockedPreview({ fileName }: { fileName: string }) {
  const { t } = useI18n();
  return (
    <div className="overflow-hidden rounded-2xl border border-edge bg-surface">
      <div className="relative grid min-h-[260px] place-items-center overflow-hidden px-6 py-9 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(#dfe5ef_1px,transparent_1px),linear-gradient(90deg,#dfe5ef_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="relative">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-navy text-white shadow-[0_12px_30px_rgba(20,40,77,0.2)]">
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
            </svg>
          </span>
          <span className="mt-5 inline-flex rounded-full bg-caution-soft px-3 py-1 text-[10.5px] font-bold uppercase tracking-[.1em] text-caution">{t("app.locked.badge")}</span>
          <h3 className="mt-3 text-[18px] text-navy">{t("app.locked.title")}</h3>
          <p className="mx-auto mt-2 max-w-[38ch] text-[12.5px] leading-5 text-muted">{t("app.locked.text")}</p>
          <p className="mx-auto mt-4 max-w-[260px] truncate rounded-lg border border-line bg-white px-3 py-2 text-[11.5px] font-medium text-ink">{fileName}</p>
        </div>
      </div>
      <div className="flex items-start gap-2.5 border-t border-edge bg-white px-4 py-3 text-[11.5px] leading-5 text-muted">
        <svg className="mt-0.5 shrink-0 text-ok" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" /></svg>
        {t("app.locked.footer")}
      </div>
    </div>
  );
}
