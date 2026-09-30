"use client";

import { useI18n } from "@/views/components/I18nProvider";
import type { TranslationKey } from "@/lib/i18n";

/**
 * Workflow — le "paiement en deux temps" reste le bon modèle mental
 * (ARCHITECTURE.md §1.1), présenté ici comme une vraie ligne du temps reliée
 * plutôt qu'une grille de cartes égales. Purement présentationnel ; le vrai
 * parcours vit dans /commander et /dashboard.
 */
const STEPS = [
  { title: "workflow.step1Title", desc: "workflow.step1Desc" },
  { title: "workflow.step2Title", desc: "workflow.step2Desc" },
  { title: "workflow.step3Title", desc: "workflow.step3Desc", tag: "workflow.deposit", pay: true },
  { title: "workflow.step4Title", desc: "workflow.step4Desc", tag: "workflow.locked" },
  { title: "workflow.step5Title", desc: "workflow.step5Desc", tag: "workflow.unlocked", pay: true },
];

export default function Workflow() {
  const { t } = useI18n();
  return (
    <section id="workflow" className="relative overflow-hidden bg-navy py-[calc(5.5rem*var(--section-scale))] text-white">
      <svg
        className="pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] text-white opacity-[.04]"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" />
      </svg>

      <div className="relative mx-auto max-w-(--site-width) px-[22px]">
        <div className="mb-16 max-w-[660px]">
          <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-accent-light">
            <span className="h-0.5 w-5.5 rounded bg-accent-light" />
            {t("workflow.eyebrow")}
          </span>
          <h2 className="text-[clamp(28px,3.4vw,40px)] text-white">
            {t("workflow.title")}
          </h2>
          <p className="mt-3.5 text-[17px] text-line">
            {t("workflow.description")}
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          <div
            className="absolute left-0 right-0 top-[19px] hidden lg:block"
            style={{
              height: 1,
              background:
                "repeating-linear-gradient(to right, rgba(255,255,255,.22) 0 10px, transparent 10px 18px)",
            }}
            aria-hidden="true"
          />
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <div
                className={`relative z-10 mb-5 grid h-9.5 w-9.5 place-items-center rounded-full border-2 font-serif text-[15px] font-semibold ${
                  step.pay
                    ? "border-ok bg-ok text-white"
                    : "border-white/25 bg-navy text-white"
                }`}
              >
                {`0${i + 1}`}
              </div>
              <h4 className="text-[16.5px] text-white">{t(step.title as TranslationKey)}</h4>
              <p className="mt-2 max-w-[26ch] text-[13.5px] text-muted-light">{t(step.desc as TranslationKey)}</p>
              {step.tag && (
                <span
                  className={`mt-3.5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-semibold ${
                    step.pay ? "bg-ok/15 text-ok-light" : "bg-white/10 text-muted-light"
                  }`}
                >
                  {t(step.tag as TranslationKey)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
