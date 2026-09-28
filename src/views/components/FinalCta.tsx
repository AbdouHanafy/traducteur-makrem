"use client";

import Link from "next/link";
import { useI18n } from "@/views/components/I18nProvider";

export default function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-navy-2 py-20 text-white">
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full opacity-[.16]"
        style={{ background: "radial-gradient(circle, #B4894E 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-[1160px] flex-col items-center gap-7 px-[22px] text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/[.16] bg-white/[.06] px-3.5 py-1.5 text-[13px] font-medium text-[#dbe6f8]">
          {t("cta.badge")}
        </span>
        <h2 className="max-w-[22ch] text-[clamp(28px,3.6vw,42px)] text-white">
          {t("cta.title")}
        </h2>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Link
            href="/commander"
            className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-[28px] py-[16px] text-base font-semibold text-white shadow-[0_8px_22px_rgba(36,86,184,.35)] transition-colors hover:bg-blue-2"
          >
            {t("nav.orderLong")}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-[11px] border-[1.5px] border-white/[.28] px-[28px] py-[16px] text-base font-semibold text-white transition-colors hover:border-white"
          >
            {t("cta.contact")}
          </Link>
        </div>
      </div>
    </section>
  );
}
