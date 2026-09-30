"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "@/views/components/LogoutButton";
import BrandLogo from "@/views/components/BrandLogo";
import BrandName from "@/views/components/BrandName";
import { useI18n } from "@/views/components/I18nProvider";

export type WorkspaceIcon = "home" | "orders" | "users" | "page" | "services" | "articles" | "reviews" | "faq" | "media" | "files" | "support" | "account";

export interface WorkspaceNavItem {
  href: string;
  label: string;
  icon: WorkspaceIcon;
}

export interface WorkspaceNavGroup {
  label?: string;
  items: WorkspaceNavItem[];
}

function Icon({ name, className = "h-5 w-5" }: { name: WorkspaceIcon; className?: string }) {
  const paths: Record<WorkspaceIcon, React.ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10M9.5 20v-6h5v6" /></>,
    orders: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    page: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></>,
    services: <><path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" /><path d="m4 12 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5" /></>,
    articles: <><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    reviews: <path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84L6.6 19.6l1.03-6-4.36-4.25 6.03-.88L12 3Z" />,
    faq: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 1 1 3.2 2.4c-.8.3-.8.9-.8 1.6M12 17h.01" /></>,
    media: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m3 17 4.5-4.5 3 3L14 12l7 7" /></>,
    files: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    support: <><circle cx="12" cy="12" r="9" /><path d="M5 15h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H5M19 15h-2a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2M15 18h-3" /></>,
    account: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  };

  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function isActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function WorkspaceShell({ mode, user, groups, children, primaryAction }: {
  mode: "admin" | "client";
  user: { name: string; email: string };
  groups: WorkspaceNavGroup[];
  children: React.ReactNode;
  primaryAction?: { href: string; label: string };
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const allItems = groups.flatMap((group) => group.items);
  const currentItem = [...allItems].reverse().find((item) => isActive(pathname, item.href));
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "MA";
  const homeHref = mode === "admin" ? "/admin" : "/dashboard";

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const navigation = (
    <div className="grid gap-6">
      {groups.map((group, index) => (
        <div key={group.label ?? index}>
          {group.label && <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{group.label}</div>}
          <nav className="grid gap-1" aria-label={group.label}>
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all ${active ? "bg-white text-navy shadow-[0_8px_24px_rgba(0,0,0,0.16)]" : "text-slate-300 hover:bg-white/8 hover:text-white"}`}>
                  {active && <span className="absolute -left-4 h-6 w-1 rounded-r-full bg-[#5f8df3]" />}
                  <Icon name={item.icon} className={`h-[18px] w-[18px] shrink-0 ${active ? "text-blue" : "text-slate-400 group-hover:text-white"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );

  const sidebar = (
    <>
      <div className="flex items-center justify-between gap-3 px-1">
        <Link href={homeHref} className="flex min-w-0 items-center gap-3">
          <BrandLogo size="sm" onDark priority />
          <BrandName size="compact" onDark />
        </Link>
        <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label={t("app.shell.closeMenu")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {primaryAction && <Link href={primaryAction.href} onClick={() => setMobileOpen(false)} className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-[#4d7ee8] px-4 py-3 text-[13.5px] font-semibold text-white shadow-[0_10px_25px_rgba(36,86,184,0.3)] transition hover:bg-[#6592ef]"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>{primaryAction.label}</Link>}

      <div className="mt-8 flex-1 overflow-y-auto pr-1">{navigation}</div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#315fae] text-[11.5px] font-bold text-white">{initials}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-semibold text-white">{user.name}</span><span className="block truncate text-[10.5px] text-slate-400">{user.email}</span></span>
        </div>
        <div className="flex items-center justify-between px-1"><Link href="/" className="text-[12px] font-medium text-slate-400 hover:text-white">{t("app.shell.viewSite")}</Link><LogoutButton variant="sidebar" /></div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col overflow-hidden bg-navy-2 px-5 py-6 shadow-[12px_0_40px_rgba(15,29,54,0.08)] lg:flex">{sidebar}</aside>
      {mobileOpen && <button type="button" className="fixed inset-0 z-50 bg-[#07101f]/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-label={t("app.shell.closeMenu")} />}
      <aside role="dialog" aria-modal="true" aria-label={t("app.shell.navigation")} aria-hidden={!mobileOpen} inert={!mobileOpen ? true : undefined} className={`fixed inset-y-0 left-0 z-[60] flex w-[min(86vw,310px)] flex-col bg-navy-2 px-5 py-6 shadow-2xl transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>{sidebar}</aside>

      <div className="min-w-0 lg:pl-[272px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e6eaf1] bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-line bg-white p-2.5 text-navy shadow-sm lg:hidden" aria-label={t("app.shell.openMenu")} aria-expanded={mobileOpen}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
            <div className="min-w-0"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{mode === "admin" ? t("app.shell.backoffice") : t("app.shell.mySpace")}</div><div className="truncate text-[15px] font-semibold text-navy">{currentItem?.label ?? (mode === "admin" ? t("app.shell.admin") : t("app.shell.clientSpace"))}</div></div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-[12.5px] font-semibold text-muted transition hover:border-blue/30 hover:text-blue sm:flex">{t("app.shell.viewSite")}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M7 7h10v10" /></svg></Link>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-soft text-[11px] font-bold text-blue-2 lg:hidden">{initials}</span>
          </div>
        </header>
        <main className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_right,rgba(36,86,184,0.055),transparent_32rem)]">{children}</main>
      </div>
    </div>
  );
}
