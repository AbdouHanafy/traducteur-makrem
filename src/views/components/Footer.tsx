"use client";

import Link from "next/link";
import BrandLogo from "@/views/components/BrandLogo";
import BrandName from "@/views/components/BrandName";
import { useI18n } from "@/views/components/I18nProvider";

export default function Footer() {
  const { t } = useI18n();
  const phonePrimary = t("contact.phonePrimary");
  const phoneSecondary = t("contact.phoneSecondary");
  const email = t("contact.email");
  return (
    <footer className="bg-navy-2 text-slate-300">
      <div className="border-b border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-(--site-width) grid-cols-1 gap-5 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { title: t("footer.certified"), detail: t("footer.certifiedDetail"), icon: "M5 12l4 4L19 6" },
            { title: t("footer.private"), detail: t("footer.privateDetail"), icon: "M6 10V8a6 6 0 0 1 12 0v2M5 10h14v11H5V10Z" },
            { title: t("footer.tracking"), detail: t("footer.trackingDetail"), icon: "M4 12h4l3 6 4-12 2 6h3" },
          ].map((item) => <div key={item.title} className="flex items-center gap-3 sm:justify-center"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-accent-light"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={item.icon} /></svg></span><span><span className="block text-[12.5px] font-semibold text-white">{item.title}</span><span className="block text-[10.5px] text-slate-400">{item.detail}</span></span></div>)}
        </div>
      </div>

      <div className="mx-auto max-w-(--site-width) px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_.85fr_.85fr_1.1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3"><BrandLogo size="md" onDark /><BrandName onDark /></Link>
            <p className="mt-5 max-w-[38ch] text-[13px] leading-6 text-slate-400">{t("footer.description")}</p>
            <Link href="/commander" className="mt-5 inline-flex items-center gap-2 text-[12.5px] font-semibold text-accent-light hover:text-white">{t("footer.quote")} <span>→</span></Link>
          </div>
          <div><h2 className="mb-4 text-[11px] font-bold uppercase tracking-[.15em] text-white">{t("footer.navigation")}</h2><ul className="grid gap-2.5 text-[12.5px] text-slate-400"><li><Link href="/a-propos" className="hover:text-white">{t("nav.about")}</Link></li><li><Link href="/services" className="hover:text-white">{t("nav.services")}</Link></li><li><Link href="/articles" className="hover:text-white">{t("nav.articles")}</Link></li><li><Link href="/faq" className="hover:text-white">{t("nav.faq")}</Link></li></ul></div>
          <div><h2 className="mb-4 text-[11px] font-bold uppercase tracking-[.15em] text-white">{t("footer.clientArea")}</h2><ul className="grid gap-2.5 text-[12.5px] text-slate-400"><li><Link href="/commander" className="hover:text-white">{t("footer.newOrder")}</Link></li><li><Link href="/dashboard" className="hover:text-white">{t("footer.dashboard")}</Link></li><li><Link href="/dashboard/orders" className="hover:text-white">{t("footer.track")}</Link></li><li><Link href="/dashboard/fichiers" className="hover:text-white">{t("footer.documents")}</Link></li></ul></div>
          <div><h2 className="mb-4 text-[11px] font-bold uppercase tracking-[.15em] text-white">{t("nav.contact")}</h2><address className="grid gap-3 text-[12.5px] not-italic text-slate-400"><a href={`tel:${phonePrimary.replace(/[^+\d]/g, "")}`} className="flex items-start gap-2.5 hover:text-white"><span className="mt-0.5 text-accent-light">T</span><span>{phonePrimary}<br />{phoneSecondary}</span></a><a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-white"><span className="text-accent-light">E</span><span className="break-all">{email}</span></a><div className="flex items-start gap-2.5"><span className="text-accent-light">A</span><span>{t("contact.addressLine1")}<br />{t("contact.addressLine2")}</span></div></address></div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>{t("footer.copyright", { year: new Date().getFullYear() })}</span><nav aria-label={t("legal.link.notice")} className="flex flex-wrap gap-x-4 gap-y-1"><Link href="/mentions-legales" className="hover:text-white">{t("legal.link.notice")}</Link><Link href="/conditions-generales" className="hover:text-white">{t("legal.link.terms")}</Link><Link href="/confidentialite" className="hover:text-white">{t("legal.link.privacy")}</Link></nav></div>
      </div>
    </footer>
  );
}
