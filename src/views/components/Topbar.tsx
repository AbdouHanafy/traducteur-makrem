"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Topbar — structure et libellés conservés de la maquette (voir ARCHITECTURE.md §3) :
 * logo/sceau, nom + rôle, nav, CTA "Espace client". Affiné pour l'accessibilité (menu
 * mobile avec fermeture au clavier) et pour pointer vers de vraies routes plutôt que
 * des ancres uniques (#espace pour "Commander" ET "Suivi" dans le prototype).
 *
 * Le CTA "Espace client" est statique (→ /login) pour l'instant : il deviendra
 * dynamique (→ /dashboard si connecté) une fois l'auth branchée en Phase 2.
 */
const NAV_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#workflow", label: "Comment ça marche" },
  { href: "/commander", label: "Commander" },
  { href: "/dashboard/orders", label: "Suivi" },
  { href: "/#contact", label: "Contact" },
];

export default function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-2/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1160px] items-center gap-5 px-[22px]">
        <Link href="/" aria-label="Accueil" className="flex items-center gap-3 text-white">
          <svg className="h-11 w-11 shrink-0" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="30" stroke="#4C79D4" strokeWidth="2" />
            <circle
              cx="32"
              cy="32"
              r="24.5"
              stroke="#B4894E"
              strokeWidth="1"
              strokeDasharray="2 3"
              opacity=".7"
            />
            <text
              x="32"
              y="40"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontWeight="700"
              fontSize="24"
              fill="#fff"
            >
              MA
            </text>
          </svg>
          <span>
            <span className="block font-serif text-[19px] font-semibold leading-tight">
              Maître Makram Arfaoui
            </span>
            <span className="mt-0.5 block text-[11.5px] uppercase tracking-wider text-[#9fb2d6]">
              Traducteur &amp; Interprète Assermenté
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14.5px] font-medium text-[#c9d5ea] transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="ml-1.5 hidden items-center rounded-[11px] bg-blue px-[22px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_22px_rgba(36,86,184,.28)] transition-colors hover:bg-blue-2 md:inline-flex"
        >
          Espace client
        </Link>

        <button
          type="button"
          className="ml-auto rounded-lg p-2 text-white md:hidden"
          aria-label="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav
          className="flex flex-col gap-0 border-t border-white/10 bg-navy-2 px-[22px] pb-4 pt-2 md:hidden"
          aria-label="Navigation mobile"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="border-b border-white/[.07] py-3 text-[#c9d5ea]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="mt-3 inline-flex items-center justify-center rounded-[11px] bg-blue px-[22px] py-[13px] text-[15px] font-semibold text-white"
          >
            Espace client
          </Link>
        </nav>
      )}
    </header>
  );
}
