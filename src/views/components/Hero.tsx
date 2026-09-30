"use client";

import Link from "next/link";
import { useI18n } from "@/views/components/I18nProvider";

/**
 * Hero — identité "cabinet juridique premium" appuyée : watermark sceau/compas en
 * fond, ruban de crédentiales façon en-tête d'acte plutôt qu'une rangée de badges
 * génériques, mockup document avec sceau en relief. Pas de promesse juridique non
 * vérifiée (cf. ARCHITECTURE.md §1.1) : le texte reste factuel.
 */
export default function Hero() {
  const { t } = useI18n();
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[linear-gradient(175deg,var(--color-navy-2)_0%,var(--color-navy)_58%,#132752_100%)] pb-16 pt-14 text-white"
    >
      <svg
        className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] text-seal opacity-[.09] md:-right-24 md:-top-24"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="1 5" />
        <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="1" />
        <path d="M100 2v196M2 100h196" stroke="currentColor" strokeWidth="0.5" />
      </svg>

      <div className="mx-auto grid max-w-[1160px] items-center gap-14 px-[22px] md:grid-cols-[1.08fr_.92fr]">
        <div className="relative">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[.16] bg-white/[.08] px-3.5 py-1.5 text-[13px] font-medium text-[#dbe6f8]">
            <span className="h-1.5 w-1.5 rounded-full bg-ok shadow-[0_0_0_4px_rgba(30,158,106,.25)]" />
            {t("hero.credential")}
          </span>
          <h1 className="text-[clamp(34px,4.6vw,58px)] font-semibold tracking-tight text-white">
            {t("hero.titleBefore")} <br className="hidden md:block" />
            <span className="font-medium italic text-[#9fc0ff]">{t("hero.titleAccent")}</span>{" "}
            {t("hero.titleAfter")}
          </h1>
          <p className="mt-5 max-w-[47ch] text-lg text-[#c4d2ea]">
            {t("hero.description")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/commander"
              className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-[26px] py-[15px] text-base font-semibold text-white shadow-[0_8px_22px_rgba(36,86,184,.28)] transition-colors hover:bg-blue-2"
            >
              {t("nav.orderLong")}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center rounded-[11px] border-[1.5px] border-white/[.28] px-[26px] py-[15px] text-base font-semibold text-white transition-colors hover:border-white"
            >
              {t("hero.discover")}
            </Link>
          </div>

          <div className="mt-11 border-t border-white/[.14] pt-6">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
              <div>
                <div className="font-serif text-[13px] uppercase tracking-[.12em] text-[#8fb4ff]">
                  {t("hero.status")}
                </div>
                <div className="mt-1 text-[14px] font-medium text-white">
                  {t("hero.statusValue")}
                </div>
              </div>
              <div className="sm:border-l sm:border-white/[.14] sm:pl-8">
                <div className="font-serif text-[13px] uppercase tracking-[.12em] text-[#8fb4ff]">
                  {t("hero.languages")}
                </div>
                <div className="mt-1 text-[14px] font-medium text-white">{t("hero.languagesValue")}</div>
              </div>
              <div className="sm:border-l sm:border-white/[.14] sm:pl-8">
                <div className="font-serif text-[13px] uppercase tracking-[.12em] text-[#8fb4ff]">
                  {t("hero.payment")}
                </div>
                <div className="mt-1 text-[14px] font-medium text-white">{t("hero.paymentValue")}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden h-[440px] md:block" aria-hidden="true">
          <div className="absolute right-24 top-[62px] h-[330px] w-[250px] rotate-[-7deg] overflow-hidden rounded-xl bg-white text-ink opacity-55 shadow-[var(--shadow-lg)] saturate-[.8]">
            <div className="border-b border-line px-[22px] pb-3 pt-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue">
                {t("hero.source")}
              </div>
              <div className="mt-1 font-serif text-[15px] font-semibold">{t("hero.sourceSample")}</div>
            </div>
            <div className="grid gap-2.5 px-[22px] py-4.5">
              {[100, 88, 72, 100, 88].map((w, i) => (
                <span key={i} className="block h-2 rounded bg-[#e7ecf4]" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>

          <div className="absolute right-3.5 top-7 h-[372px] w-[288px] rotate-[4deg] overflow-hidden rounded-xl bg-white text-ink shadow-[var(--shadow-lg)]">
            <div className="border-b border-line px-[22px] pb-3 pt-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue">
                {t("hero.certified")}
              </div>
              <div className="mt-1 font-serif text-[15px] font-semibold">{t("hero.birth")}</div>
            </div>
            <div className="grid gap-2.5 px-[22px] py-4.5">
              {[100, 88, 72, 100, 88, 72].map((w, i) => (
                <span key={i} className="block h-2 rounded bg-[#e7ecf4]" style={{ width: `${w}%` }} />
              ))}
            </div>
            <svg className="absolute bottom-[14px] right-4 h-28 w-28 rotate-[-12deg] drop-shadow-[0_2px_3px_rgba(20,40,77,.18)]" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#B4894E" strokeWidth="2.5" />
              <circle cx="60" cy="60" r="46" fill="none" stroke="#B4894E" strokeWidth="1" strokeDasharray="1 3" />
              <path id="ct" d="M60,60 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" fill="none" />
              <text fontFamily="Inter" fontSize="9" fontWeight="700" fill="#B4894E" letterSpacing="1.4">
                <textPath href="#ct" startOffset="4%">
                  {t("hero.stampRing")}
                </textPath>
              </text>
              <text x="60" y="58" textAnchor="middle" fontFamily="Spectral" fontWeight="700" fontSize="21" fill="#14284D">
                MA
              </text>
              <text x="60" y="73" textAnchor="middle" fontFamily="Inter" fontSize="7" fill="#B4894E" letterSpacing="1">
                {t("hero.stampCenter")}
              </text>
            </svg>
          </div>

          <div className="absolute -left-4 top-[132px] flex -rotate-3 items-center gap-2.5 rounded-xl bg-white px-3.5 py-3 text-navy shadow-[var(--shadow-md)]">
            <div className="grid h-8.5 w-8.5 place-items-center rounded-[9px] bg-ok-soft text-ok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <b className="block text-[13px]">{t("hero.compliant")}</b>
              <span className="text-[11px] text-muted">{t("hero.seal")}</span>
            </div>
          </div>

          <div
            className="absolute -bottom-2 -right-3 flex items-center gap-2.5 bg-navy px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-[var(--shadow-md)]"
            style={{ clipPath: "polygon(10px 0,100% 0,100% 100%,10px 100%,0 50%)" }}
          >
            <div className="grid h-7.5 w-7.5 place-items-center rounded-lg bg-white/[.12]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
            </div>
            {t("hero.unlocked")}
          </div>
        </div>
      </div>
    </section>
  );
}
