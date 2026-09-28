"use client";

import { useI18n } from "@/views/components/I18nProvider";

/**
 * Prise de position du cabinet — une déclaration personnelle attribuée à Maître
 * Arfaoui lui-même (pas un faux avis client) : casse le rythme "hero / cartes /
 * cartes" et donne une voix humaine à la page.
 */
export default function Statement() {
  const { t } = useI18n();
  return (
    <section className="bg-mist py-20">
      <div className="mx-auto max-w-[820px] px-[22px] text-center">
        <svg
          className="mx-auto mb-6 h-10 w-10 text-seal opacity-70"
          viewBox="0 0 32 32"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 8C5.6 8 2 11.6 2 16s3.6 8 8 8h1v-4h-1c-2.2 0-4-1.8-4-4s1.8-4 4-4h1V8h-1zm14 0c-4.4 0-8 3.6-8 8s3.6 8 8 8h1v-4h-1c-2.2 0-4-1.8-4-4s1.8-4 4-4h1V8h-1z" />
        </svg>
        <p className="font-serif text-[clamp(20px,2.6vw,28px)] italic leading-snug text-navy">
          {t("statement.quote")}
        </p>
        <div className="mx-auto mt-6 h-px w-14 bg-seal" />
        <p className="mt-5 text-[14.5px] font-semibold text-navy">{t("statement.name")}</p>
        <p className="text-[13px] text-muted">{t("statement.role")}</p>
      </div>
    </section>
  );
}
