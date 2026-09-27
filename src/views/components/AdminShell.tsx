"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/views/components/LogoutButton";

const NAV = [
  { href: "/admin/orders", label: "Commandes", staffAllowed: true },
  { href: "/admin/home-sections", label: "Page d'accueil", staffAllowed: false },
  { href: "/admin/services", label: "Services", staffAllowed: false },
  { href: "/admin/articles", label: "Articles", staffAllowed: false },
  { href: "/admin/faq", label: "FAQ", staffAllowed: false },
  { href: "/admin/media", label: "Médiathèque", staffAllowed: false },
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
      <span className="font-serif text-[14.5px] font-semibold text-navy">Backoffice</span>
    </Link>
  );
}

export default function AdminShell({ role, children }: { role: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = NAV.filter((item) => item.staffAllowed || isAdmin);

  // Ferme le menu mobile à chaque changement de page — sinon il reste ouvert par-dessus la
  // nouvelle page après un clic sur un lien. Ajustement pendant le rendu (pattern React
  // recommandé pour "réinitialiser un état quand une prop change") plutôt qu'un effet.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

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
        <nav className="border-b border-line bg-white px-4 pb-4 lg:hidden" aria-label="Navigation backoffice">
          <div className="grid gap-1 pt-2">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[9px] px-3 py-2.5 text-[14.5px] font-medium ${
                    isActive ? "bg-blue-soft text-blue-2" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 border-t border-line pt-3">
            <LogoutButton />
          </div>
        </nav>
      )}

      {/* Sidebar persistante — lg et plus uniquement */}
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-line bg-white px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <Logo />
        </div>

        <nav className="grid gap-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[9px] px-3 py-2.5 text-[14px] font-medium transition-colors ${
                  isActive ? "bg-blue-soft text-blue-2" : "text-muted hover:bg-mist hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2 pt-6">
          <LogoutButton />
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-mist">{children}</div>
    </div>
  );
}
