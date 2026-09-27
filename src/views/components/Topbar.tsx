"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

/**
 * Topbar — structure inspirée d'un header "booking direct" (nav en petites capitales avec
 * lien actif souligné, connexion en texte simple, un seul CTA plein contrasté) adaptée à
 * l'identité navy/or du site plutôt qu'un copier-coller de palette.
 */
const NAV_LINKS = [
  { href: "/a-propos", label: "À propos" },
  { href: "/services", label: "Services" },
  { href: "/articles", label: "Articles" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const spaceHref = session ? "/dashboard" : "/login";
  const spaceLabel = session ? "Mon espace" : "Se connecter";

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-2/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1160px] items-center gap-6 px-[22px]">
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
            <span className="block font-serif text-[18px] font-bold uppercase leading-tight tracking-wide">
              Maître Makram Arfaoui
            </span>
            <span className="mt-0.5 block text-[11px] uppercase tracking-[.14em] text-[#9fb2d6]">
              Traducteur &amp; Interprète Assermenté
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap border-b-2 pb-1 text-[12.5px] font-semibold uppercase tracking-[.08em] transition-colors ${
                  isActive
                    ? "border-seal text-seal"
                    : "border-transparent text-[#c9d5ea] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-2 hidden items-center gap-5 lg:flex">
          <Link
            href={spaceHref}
            className="whitespace-nowrap text-[12.5px] font-semibold uppercase tracking-[.08em] text-[#c9d5ea] transition-colors hover:text-white"
          >
            {spaceLabel}
          </Link>
          <span className="h-6 w-px bg-white/15" aria-hidden="true" />
          <Link
            href="/commander"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-seal px-[20px] py-[12px] text-[13px] font-bold uppercase tracking-[.05em] text-navy-2 transition-colors hover:bg-[#c49a5e]"
          >
            Commander
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto rounded-lg p-2 text-white lg:hidden"
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
          className="flex flex-col gap-0 border-t border-white/10 bg-navy-2 px-[22px] pb-4 pt-2 lg:hidden"
          aria-label="Navigation mobile"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`border-b border-white/[.07] py-3 text-[13px] font-semibold uppercase tracking-[.08em] ${
                  isActive ? "text-seal" : "text-[#c9d5ea]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-3 grid gap-2.5">
            <Link
              href={spaceHref}
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center rounded-[11px] border-[1.5px] border-white/[.28] px-[22px] py-[13px] text-[13px] font-semibold uppercase tracking-[.08em] text-white"
            >
              {spaceLabel}
            </Link>
            <Link
              href="/commander"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 rounded-[11px] bg-seal px-[22px] py-[13px] text-[13px] font-bold uppercase tracking-[.05em] text-navy-2"
            >
              Commander
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
