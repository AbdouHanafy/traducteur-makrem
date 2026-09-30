"use client";

import type { TranslatedFileAccess } from "@/lib/order-file-access";
import { useI18n } from "@/views/components/I18nProvider";

const ACCESS_COPY: Record<TranslatedFileAccess, { label: string; title: string; classes: string }> = {
  NOT_READY: {
    label: "app.access.notReady",
    title: "app.access.notReadyTitle",
    classes: "bg-mist text-muted",
  },
  LOCKED: {
    label: "app.access.locked",
    title: "app.access.lockedTitle",
    classes: "bg-[#fff3df] text-[#91540e]",
  },
  UNLOCKED: {
    label: "app.access.unlocked",
    title: "app.access.unlockedTitle",
    classes: "bg-[#e7f6ef] text-[#267254]",
  },
};

export default function FileAccessBadge({ access }: { access: TranslatedFileAccess }) {
  const { t } = useI18n();
  const copy = ACCESS_COPY[access];
  const isUnlocked = access === "UNLOCKED";

  return (
    <span
      title={t(copy.title)}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${copy.classes}`}
    >
      {access === "NOT_READY" ? (
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2h9l5 5v15H6z" />
          <path d="M14 2v6h6" />
        </svg>
      ) : (
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="4" y="10" width="16" height="11" rx="2" />
          {isUnlocked ? <path d="M8 10V7a4 4 0 0 1 7.4-2.1" /> : <path d="M8 10V7a4 4 0 0 1 8 0v3" />}
        </svg>
      )}
      {t(copy.label)}
    </span>
  );
}
