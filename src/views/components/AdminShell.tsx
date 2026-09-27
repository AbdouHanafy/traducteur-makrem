"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/views/components/LogoutButton";

const NAV = [
  { href: "/admin/orders", label: "Commandes", staffAllowed: true },
  { href: "/admin/home-sections", label: "Page d'accueil", staffAllowed: false },
  { href: "/admin/services", label: "Services", staffAllowed: false },
  { href: "/admin/faq", label: "FAQ", staffAllowed: false },
  { href: "/admin/media", label: "Médiathèque", staffAllowed: false },
];

export default function AdminShell({ role, children }: { role: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-line bg-white px-4 py-6">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2">
          <svg className="h-8 w-8 shrink-0" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="30" stroke="#2456B8" strokeWidth="2" />
            <text x="32" y="40" textAnchor="middle" fontFamily="Spectral, serif" fontWeight="700" fontSize="24" fill="#14284D">
              MA
            </text>
          </svg>
          <span className="font-serif text-[14.5px] font-semibold text-navy">Backoffice</span>
        </Link>

        <nav className="grid gap-1">
          {NAV.filter((item) => item.staffAllowed || isAdmin).map((item) => {
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
