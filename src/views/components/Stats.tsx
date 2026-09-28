"use client";

import { useI18n } from "@/views/components/I18nProvider";
import type { TranslationKey } from "@/lib/i18n";

/**
 * Bande de repères — volontairement des faits de fonctionnement (déjà établis
 * ailleurs sur le site : langues, étapes de suivi, paiement en deux temps),
 * pas des métriques commerciales invérifiables (nombre de clients, années
 * d'expérience...) qui n'ont pas leur place tant qu'elles ne sont pas fournies
 * par le cabinet.
 */
const STATS = [
  { value: "3", label: "stats.languages", detail: "hero.languagesValue" },
  { value: "50/50", label: "stats.payment", detail: "stats.paymentDetail" },
  { value: "5", label: "stats.steps", detail: "stats.stepsDetail" },
  { value: "100%", label: "stats.compliance", detail: "stats.complianceDetail" },
];

export default function Stats() {
  const { t } = useI18n();
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto max-w-[1160px] px-[22px] py-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`relative pl-5 ${i > 0 ? "lg:border-l lg:border-line" : ""}`}
            >
              <span className="absolute left-0 top-1 h-full w-[3px] bg-seal lg:hidden" />
              <div className="font-serif text-[32px] leading-none text-navy">{s.value}</div>
              <div className="mt-2 text-[13.5px] font-semibold text-ink">{t(s.label as TranslationKey)}</div>
              <div className="mt-0.5 text-[12.5px] text-muted">{t(s.detail as TranslationKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
