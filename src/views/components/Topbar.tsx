"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

const SERVICES = [
  { slug: "etat-civil", label: "État civil", detail: "Naissance, mariage, divorce" },
  { slug: "diplomes-releves", label: "Diplômes & relevés", detail: "Études et équivalences" },
  { slug: "contrats-actes", label: "Contrats & actes", detail: "Documents professionnels" },
  { slug: "documents-judiciaires", label: "Documents judiciaires", detail: "Jugements et procédures" },
  { slug: "interpretariat", label: "Interprétariat", detail: "Missions officielles" },
];

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "Le cabinet" },
  { href: "/articles", label: "Articles" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

function Brand() {
  return (
    <Link href="/" aria-label="Accueil — Maître Makram Arfaoui" className="flex min-w-0 items-center gap-3 text-navy">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-blue/20 bg-blue-soft font-serif text-[15px] font-bold text-navy">MA</span>
      <span className="min-w-0">
        <span className="block truncate font-serif text-[16px] font-semibold leading-tight text-navy">Makram Arfaoui</span>
        <span className="mt-0.5 block truncate text-[9.5px] font-semibold uppercase tracking-[.14em] text-muted">Traducteur assermenté</span>
      </span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(pathname.startsWith("/services"));
  const accountHref = session?.user.role === "ADMIN" ? "/admin" : session ? "/dashboard" : "/login";
  const accountLabel = session?.user.role === "ADMIN" ? "Administration" : session ? "Mon espace" : "Connexion";

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

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.slice(0, 2).map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined} className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${isActive(pathname, link.href) ? "bg-blue-soft text-blue-2" : "text-muted hover:bg-[#f6f8fb] hover:text-navy"}`}>{link.label}</Link>
          ))}

          <div className="group relative">
            <Link href="/services" aria-current={pathname.startsWith("/services") ? "page" : undefined} className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${pathname.startsWith("/services") ? "bg-blue-soft text-blue-2" : "text-muted hover:bg-[#f6f8fb] hover:text-navy"}`}>Services <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="transition group-hover:rotate-180 group-focus-within:rotate-180"><path d="m6 9 6 6 6-6" /></svg></Link>
            <div className="invisible absolute left-1/2 top-full w-[330px] -translate-x-1/2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white p-2 shadow-[0_20px_55px_rgba(20,40,77,0.16)]">
                {SERVICES.map((service) => <Link key={service.slug} href={`/services#${service.slug}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[#f5f8fd]"><span><span className="block text-[12.5px] font-semibold text-ink">{service.label}</span><span className="block text-[10.5px] text-muted">{service.detail}</span></span><span className="text-slate-300">→</span></Link>)}
                <Link href="/services" className="mt-1 flex items-center justify-between rounded-xl bg-blue-soft px-3 py-2.5 text-[12px] font-semibold text-blue-2">Tous les services <span>→</span></Link>
              </div>
            </div>
          </div>

          {NAV_LINKS.slice(2).map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined} className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${isActive(pathname, link.href) ? "bg-blue-soft text-blue-2" : "text-muted hover:bg-[#f6f8fb] hover:text-navy"}`}>{link.label}</Link>
          ))}
        </nav>

        <div className="ml-5 hidden items-center gap-2 border-l border-line pl-5 lg:flex">
          <Link href={accountHref} className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold text-navy transition hover:bg-[#f5f7fb]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>{accountLabel}</Link>
          <Link href="/commander" className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_8px_20px_rgba(20,40,77,0.16)] transition hover:-translate-y-0.5 hover:bg-navy-2">Commander <span aria-hidden="true">→</span></Link>
        </div>

        <button type="button" className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-navy shadow-sm lg:hidden" aria-label="Ouvrir le menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
      </div>

      {mobileOpen && <button type="button" className="fixed inset-0 top-[76px] h-[calc(100vh-76px)] w-screen bg-[#07101f]/55 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" />}
      <aside role="dialog" aria-modal="true" aria-label="Navigation mobile" aria-hidden={!mobileOpen} inert={!mobileOpen ? true : undefined} className={`fixed bottom-0 right-0 top-0 z-[60] flex w-[min(88vw,360px)] flex-col bg-white p-5 shadow-2xl transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between gap-3 border-b border-line pb-5"><Brand /><button type="button" onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg bg-mist text-navy" aria-label="Fermer le menu"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg></button></div>
        <nav className="mt-5 flex-1 overflow-y-auto" aria-label="Navigation principale mobile">
          {NAV_LINKS.slice(0, 2).map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-semibold ${isActive(pathname, link.href) ? "bg-blue-soft text-blue-2" : "text-ink"}`}>{link.label}<span className="text-slate-300">→</span></Link>)}
          <button type="button" onClick={() => setMobileServicesOpen((value) => !value)} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-[14px] font-semibold ${pathname.startsWith("/services") ? "bg-blue-soft text-blue-2" : "text-ink"}`}>Services <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition ${mobileServicesOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg></button>
          {mobileServicesOpen && <div className="mb-2 ml-3 border-l border-line pl-3">{SERVICES.map((service) => <Link key={service.slug} href={`/services#${service.slug}`} onClick={() => setMobileOpen(false)} className="block py-2 text-[12.5px] text-muted">{service.label}</Link>)}<Link href="/services" onClick={() => setMobileOpen(false)} className="block py-2 text-[12.5px] font-semibold text-blue">Tous les services</Link></div>}
          {NAV_LINKS.slice(2).map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-semibold ${isActive(pathname, link.href) ? "bg-blue-soft text-blue-2" : "text-ink"}`}>{link.label}<span className="text-slate-300">→</span></Link>)}
        </nav>
        <div className="grid gap-2 border-t border-line pt-5"><Link href="/commander" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center rounded-xl bg-navy px-5 py-3.5 text-[13.5px] font-semibold text-white">Commander une traduction</Link><Link href={accountHref} onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center rounded-xl border border-line px-5 py-3 text-[13px] font-semibold text-navy">{accountLabel}</Link></div>
      </aside>
    </header>
  );
}
