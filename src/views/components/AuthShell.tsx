"use client";

import Link from "next/link";
import BrandLogo from "@/views/components/BrandLogo";
import BrandName from "@/views/components/BrandName";
import LanguageSwitcher from "@/views/components/LanguageSwitcher";
import { useI18n } from "@/views/components/I18nProvider";

/**
 * Habillage commun login/register — panneau navy éditorial (repris de l'identité Hero)
 * à gauche, formulaire à droite. Volontairement sans Topbar/Footer complets : un
 * parcours d'authentification reste focalisé (même logique que calmatrip).
 */
export default function AuthShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen bg-[#f5f7fb] lg:grid-cols-[minmax(420px,.9fr)_1.1fr]">
      <div className="relative hidden overflow-hidden bg-[linear-gradient(155deg,var(--color-navy-2)_0%,var(--color-navy)_62%,#19386e_100%)] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-12">
        <svg
          className="pointer-events-none absolute -bottom-32 -left-32 h-[480px] w-[480px] text-seal opacity-[.08]"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="1 5" />
          <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="relative flex items-start justify-between gap-4"><Link href="/" className="flex items-center gap-3"><BrandLogo size="lg" onDark priority /><BrandName size="large" onDark /></Link><LanguageSwitcher dark /></div>

        <div className="relative max-w-[42ch]">
          <span className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#8fb4ff]">
            <span className="h-0.5 w-5.5 rounded bg-[#8fb4ff]" />
            {eyebrow}
          </span>
          <p className="font-serif text-[28px] leading-snug text-white xl:text-[31px]">{title}</p>
          <p className="mt-4 text-[14px] leading-6 text-[#b9c8e4]">{subtitle}</p>
          <div className="mt-8 grid gap-3 text-[12px] text-slate-300">
            <div className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-ok/20 text-[10px] text-[#7ce0b1]">✓</span>{t("auth.tracking")}</div>
            <div className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-ok/20 text-[10px] text-[#7ce0b1]">✓</span>{t("auth.documents")}</div>
            <div className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-ok/20 text-[10px] text-[#7ce0b1]">✓</span>{t("auth.payment")}</div>
          </div>
        </div>

        <p className="relative text-[13px] text-[#8093b5]">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:py-14">
        <div className="w-full max-w-[460px] rounded-[22px] border border-[#e2e7ef] bg-white p-6 shadow-[0_18px_55px_rgba(20,40,77,0.08)] sm:p-9">
          <div className="mb-8 flex items-center justify-between gap-3 lg:hidden"><Link href="/" className="flex items-center gap-2.5">
            <BrandLogo size="sm" priority />
            <BrandName size="compact" />
          </Link><LanguageSwitcher /></div>
          {children}
          <p className="mt-7 border-t border-line pt-5 text-center text-[11px] text-muted">{t("auth.secureNote")}</p>
        </div>
      </div>
    </div>
  );
}
