"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

/**
 * Topbar — header clair (fond blanc), typo sans-serif fine en petites capitales, lien actif
 * souligné en or, un seul CTA plein (navy) contrasté. Repris de plus près d'une référence
 * "booking direct" fournie par le client, palette et poids de police corrigés après un
 * premier essai trop sombre/trop gras.
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
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1160px] items-center gap-6 px-[22px]">
        <Link href="/" aria-label="Accueil" className="flex items-center gap-2.5 text-navy">
          <svg className="h-9 w-9 shrink-0" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="30" stroke="#2456B8" strokeWidth="2" />
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
              y="39"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontWeight="700"
              fontSize="20"
              fill="#14284D"
            >
              MA
            </text>
          </svg>
          <span>
            <span className="block text-[15px] font-bold uppercase leading-tight tracking-[.02em] text-navy">
              Makram Arfaoui
            </span>
            <span className="mt-0.5 block text-[10.5px] uppercase tracking-[.14em] text-muted">
              Traducteur &middot; Assermenté
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap border-b-[1.5px] pb-1 text-[12px] font-medium uppercase tracking-[.09em] transition-colors ${
                  isActive
                    ? "border-seal text-seal"
                    : "border-transparent text-muted hover:text-navy"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-8 hidden items-center gap-5 lg:flex">
          <Link
            href={spaceHref}
            className="whitespace-nowrap text-[12px] font-medium uppercase tracking-[.09em] text-muted transition-colors hover:text-navy"
          >
            {spaceLabel}
          </Link>
          <span className="h-5 w-px bg-line" aria-hidden="true" />
          <Link
            href="/commander"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[9px] bg-navy px-[18px] py-[10px] text-[12px] font-semibold uppercase tracking-[.04em] text-white transition-colors hover:bg-navy-2"
          >
            Commander
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto rounded-lg p-2 text-navy lg:hidden"
          aria-label="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav
          className="flex flex-col gap-0 border-t border-line bg-white px-[22px] pb-4 pt-2 lg:hidden"
          aria-label="Navigation mobile"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`border-b border-line py-3 text-[12.5px] font-medium uppercase tracking-[.09em] ${
                  isActive ? "text-seal" : "text-muted"
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
              className="inline-flex items-center justify-center rounded-[10px] border-[1.5px] border-line px-[22px] py-[12px] text-[12.5px] font-semibold uppercase tracking-[.06em] text-navy"
            >
              {spaceLabel}
            </Link>
            <Link
              href="/commander"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-navy px-[22px] py-[12px] text-[12.5px] font-semibold uppercase tracking-[.04em] text-white"
            >
              Commander
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
