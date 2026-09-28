"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useI18n } from "@/views/components/I18nProvider";

export interface PartnerItem {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
}

const INSTITUTIONS = ["partners.institution1", "partners.institution2", "partners.institution3", "partners.institution4", "partners.institution5"];

function InstitutionIcon({ index }: { index: number }) {
  const paths = [
    <><path key="a" d="M4 20h16M6 17h12M7 8v7M12 8v7M17 8v7M4 6l8-3 8 3H4Z" /></>,
    <><path key="b" d="M12 3v18M5 7h14M7 7l-3 6h6L7 7ZM17 7l-3 6h6l-3-6ZM8 21h8" /></>,
    <><circle key="c1" cx="12" cy="12" r="9" /><path key="c2" d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
    <><path key="d1" d="m3 10 9-5 9 5-9 5-9-5Z" /><path key="d2" d="M7 12.5V17c3 2.2 7 2.2 10 0v-4.5M21 10v6" /></>,
    <><path key="e1" d="M5 21V9l7-5 7 5v12M9 21v-5h6v5" /><path key="e2" d="M9 11h.01M15 11h.01" /></>,
  ];
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[index]}</svg>;
}

export default function PartnersBand({ partners }: { partners: PartnerItem[] }) {
  const { t } = useI18n();
  const hasPartners = partners.length > 0;
  return (
    <section className="relative border-b border-line bg-white py-8 sm:py-10" aria-labelledby="partners-title">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[.18em] text-blue"><span className="h-px w-5 bg-blue" />{t(hasPartners ? "partners.eyebrow" : "partners.fallbackEyebrow")}</p>
            <h2 id="partners-title" className="mt-2 text-[clamp(20px,2.4vw,28px)] text-navy">{t(hasPartners ? "partners.title" : "partners.fallbackTitle")}</h2>
          </div>
          {hasPartners && <p className="max-w-md text-[12.5px] leading-5 text-muted sm:text-end">{t("partners.description")}</p>}
        </div>

        {hasPartners ? (
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0">
            {partners.map((partner) => {
              const card = <><div className="grid h-16 place-items-center">{partner.logoUrl ? <img src={partner.logoUrl} alt={`Logo ${partner.name}`} className="h-full max-h-14 w-full object-contain grayscale transition duration-300 group-hover:grayscale-0" /> : <span className="text-center font-serif text-[16px] font-semibold text-navy">{partner.name}</span>}</div>{partner.logoUrl && <span className="mt-2 block truncate text-center text-[10.5px] font-semibold text-muted">{partner.name}</span>}</>;
              const className = "group min-w-[168px] snap-start rounded-2xl border border-line bg-white px-4 py-4 shadow-[0_5px_18px_rgba(20,40,77,.035)] transition hover:-translate-y-0.5 hover:border-blue/25 hover:shadow-[0_10px_28px_rgba(20,40,77,.08)] lg:min-w-0";
              return partner.websiteUrl ? <Link key={partner.id} href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className={className}>{card}</Link> : <div key={partner.id} className={className}>{card}</div>;
            })}
          </div>
        ) : (
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
            {INSTITUTIONS.map((key, index) => <div key={key} className="flex min-w-[180px] snap-start items-center gap-3 rounded-2xl border border-line bg-[#fafbfc] px-4 py-4 text-navy lg:min-w-0"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-soft text-blue"><InstitutionIcon index={index} /></span><span className="text-[12px] font-semibold leading-4">{t(key)}</span></div>)}
          </div>
        )}
      </div>
    </section>
  );
}
