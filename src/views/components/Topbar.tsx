"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useSession } from "@/lib/auth-client";
import BrandLogo from "@/views/components/BrandLogo";
import BrandName from "@/views/components/BrandName";
import LanguageSwitcher from "@/views/components/LanguageSwitcher";
import { useI18n } from "@/views/components/I18nProvider";
import type { TranslationKey } from "@/lib/i18n";

const SERVICES = [
  { slug: "etat-civil", label: "services.civil", detail: "services.civilDetail" },
  { slug: "diplomes-releves", label: "services.diplomas", detail: "services.diplomasDetail" },
  { slug: "contrats-actes", label: "services.contracts", detail: "services.contractsDetail" },
  { slug: "documents-judiciaires", label: "services.court", detail: "services.courtDetail" },
  { slug: "interpretariat", label: "services.interpreting", detail: "services.interpretingDetail" },
];

const NAV_LINKS = [
  { href: "/", label: "nav.home" },
  { href: "/a-propos", label: "nav.about" },
  { href: "/articles", label: "nav.articles" },
  { href: "/faq", label: "nav.faq" },
  { href: "/contact", label: "nav.contact" },
];

const subscribeToHydration = () => () => {};

function Brand() {
  const { t } = useI18n();
  return (
    <Link href="/" aria-label={`${t("nav.home")} — ${t("brand.latin")}`} className="flex min-w-0 items-center gap-2.5 text-navy">
      <BrandLogo priority />
      <BrandName size="compact" />
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Topbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(pathname.startsWith("/services"));
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const accountHref = session?.user.role === "ADMIN" ? "/admin" : session ? "/dashboard" : "/login";
  const accountLabel = session?.user.role === "ADMIN" ? t("nav.admin") : session ? t("nav.account") : t("nav.login");

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7ebf2] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1200px] items-center px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label={t("app.aria.mainNav")}>
          {NAV_LINKS.slice(0, 2).map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined} className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${isActive(pathname, link.href) ? "bg-blue-soft text-blue-2" : "text-muted hover:bg-[#f6f8fb] hover:text-navy"}`}>{t(link.label as TranslationKey)}</Link>
          ))}

          <div className="group relative">
            <Link href="/services" aria-current={pathname.startsWith("/services") ? "page" : undefined} className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${pathname.startsWith("/services") ? "bg-blue-soft text-blue-2" : "text-muted hover:bg-[#f6f8fb] hover:text-navy"}`}>{t("nav.services")} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="transition group-hover:rotate-180 group-focus-within:rotate-180"><path d="m6 9 6 6 6-6" /></svg></Link>
            <div className="invisible absolute left-1/2 top-full w-[330px] -translate-x-1/2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white p-2 shadow-[0_20px_55px_rgba(20,40,77,0.16)]">
                {SERVICES.map((service) => <Link key={service.slug} href={`/services#${service.slug}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[#f5f8fd]"><span><span className="block text-[12.5px] font-semibold text-ink">{t(service.label as TranslationKey)}</span><span className="block text-[10.5px] text-muted">{t(service.detail as TranslationKey)}</span></span><span className="text-slate-300">→</span></Link>)}
                <Link href="/services" className="mt-1 flex items-center justify-between rounded-xl bg-blue-soft px-3 py-2.5 text-[12px] font-semibold text-blue-2">{t("nav.allServices")} <span>→</span></Link>
              </div>
            </div>
          </div>

          {NAV_LINKS.slice(2).map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined} className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${isActive(pathname, link.href) ? "bg-blue-soft text-blue-2" : "text-muted hover:bg-[#f6f8fb] hover:text-navy"}`}>{t(link.label as TranslationKey)}</Link>
          ))}
        </nav>

        <div className="ml-5 hidden items-center gap-2 border-l border-line pl-5 lg:flex">
          <LanguageSwitcher />
          <Link href={accountHref} className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold text-navy transition hover:bg-[#f5f7fb]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>{accountLabel}</Link>
          <Link href="/commander" className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_8px_20px_rgba(20,40,77,0.16)] transition hover:-translate-y-0.5 hover:bg-navy-2">{t("nav.order")} <span aria-hidden="true">→</span></Link>
        </div>

        <button type="button" className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-navy shadow-sm lg:hidden" aria-label={t("app.shell.openMenu")} aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
      </div>

      {mounted && createPortal(
        <>
          {mobileOpen && (
            <button
              type="button"
              className="fixed inset-0 z-[70] bg-[#07101f]/55 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label={t("app.shell.closeMenu")}
            />
          )}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t("app.aria.mobileNav")}
            aria-hidden={!mobileOpen}
            inert={!mobileOpen ? true : undefined}
            className={`fixed inset-y-0 right-0 z-[80] flex w-full max-w-[360px] flex-col bg-white px-4 pb-5 pt-4 shadow-2xl transition-transform duration-300 sm:px-5 sm:pt-5 lg:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-line pb-4">
              <Brand />
              <button type="button" onClick={() => setMobileOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mist text-navy transition hover:bg-line" aria-label={t("app.shell.closeMenu")}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-line py-3">
              <span className="text-xs font-semibold text-muted">{t("language.label")}</span>
              <LanguageSwitcher />
            </div>
            <nav className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pe-1" aria-label={t("app.aria.mainNav")}>
              {NAV_LINKS.slice(0, 2).map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-semibold ${isActive(pathname, link.href) ? "bg-blue-soft text-blue-2" : "text-ink"}`}>{t(link.label as TranslationKey)}<span className="text-slate-300">→</span></Link>)}
              <button type="button" onClick={() => setMobileServicesOpen((value) => !value)} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-[14px] font-semibold ${pathname.startsWith("/services") ? "bg-blue-soft text-blue-2" : "text-ink"}`}>{t("nav.services")} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition ${mobileServicesOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg></button>
              {mobileServicesOpen && <div className="mb-2 ms-3 border-s border-line ps-3">{SERVICES.map((service) => <Link key={service.slug} href={`/services#${service.slug}`} onClick={() => setMobileOpen(false)} className="block py-2 text-[12.5px] text-muted">{t(service.label as TranslationKey)}</Link>)}<Link href="/services" onClick={() => setMobileOpen(false)} className="block py-2 text-[12.5px] font-semibold text-blue">{t("nav.allServices")}</Link></div>}
              {NAV_LINKS.slice(2).map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-semibold ${isActive(pathname, link.href) ? "bg-blue-soft text-blue-2" : "text-ink"}`}>{t(link.label as TranslationKey)}<span className="text-slate-300">→</span></Link>)}
            </nav>
            <div className="grid shrink-0 gap-2 border-t border-line pt-4"><Link href="/commander" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center rounded-xl bg-navy px-5 py-3.5 text-center text-[13.5px] font-semibold text-white">{t("nav.orderLong")}</Link><Link href={accountHref} onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center rounded-xl border border-line px-5 py-3 text-center text-[13px] font-semibold text-navy">{accountLabel}</Link></div>
          </aside>
        </>,
        document.body,
      )}
    </header>
  );
}
