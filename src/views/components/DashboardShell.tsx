"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/views/components/LogoutButton";

const NAV = [
  {
    href: "/dashboard/orders",
    label: "Mes commandes",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 9h10M7 13h10M7 17h6" />
      </>
    ),
  },
  {
    href: "/dashboard/fichiers",
    label: "Mes fichiers",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
      </>
    ),
  },
  {
    href: "/dashboard/compte",
    label: "Paramètres",
    icon: (
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 3v2M12 19v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M3 12h2M19 12h2M4.6 19.4l1.4-1.4M18 6l1.4-1.4" />
      </>
    ),
  },
  {
    href: "/dashboard/support",
    label: "Support",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 015 .5c0 1.7-2 1.8-2.4 3.2M12 17h.01" />
      </>
    ),
  },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg className="h-8 w-8 shrink-0" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="30" stroke="#2456B8" strokeWidth="2" />
        <text x="32" y="40" textAnchor="middle" fontFamily="Spectral, serif" fontWeight="700" fontSize="24" fill="#14284D">
          MA
        </text>
      </svg>
      <span className="font-serif text-[14.5px] font-semibold text-navy">Mon espace</span>
    </Link>
  );
}

export default function DashboardShell({
  user,
  children,
}: {
  user: { name: string; email: string } | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ferme le menu mobile à chaque changement de page — même pattern que AdminShell.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  const navLinks = (
    <nav className="grid gap-1">
      {NAV.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-[14px] font-medium transition-colors ${
              isActive ? "bg-blue-soft text-blue-2" : "text-muted hover:bg-mist hover:text-navy"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
              {item.icon}
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Barre mobile : logo + burger, remplace la sidebar sous lg */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
          className="rounded-lg p-2 text-navy"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </header>

      {mobileOpen && (
        <nav className="border-b border-line bg-white px-4 pb-4 lg:hidden" aria-label="Navigation espace client">
          <div className="pt-2">{navLinks}</div>
          <div className="mt-3 border-t border-line pt-3">
            {user && (
              <div className="mb-2 px-1">
                <div className="truncate text-[13.5px] font-semibold text-ink">{user.name}</div>
                <div className="truncate text-[12.5px] text-muted">{user.email}</div>
              </div>
            )}
            <LogoutButton />
          </div>
        </nav>
      )}

      {/* Sidebar persistante — lg et plus uniquement */}
      <aside className="hidden w-[230px] shrink-0 flex-col border-r border-line bg-white px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <Logo />
        </div>

        {navLinks}

        <div className="mt-auto grid min-w-0 gap-3 border-t border-line px-2 pt-4">
          {user && (
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-semibold text-ink">{user.name}</div>
              <div className="truncate text-[12.5px] text-muted">{user.email}</div>
            </div>
          )}
          <LogoutButton />
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-mist">{children}</div>
    </div>
  );
}
