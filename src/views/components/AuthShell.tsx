import Link from "next/link";

/**
 * Habillage commun login/register — panneau navy éditorial (repris de l'identité Hero)
 * à gauche, formulaire à droite. Volontairement sans Topbar/Footer complets : un
 * parcours d'authentification reste focalisé (même logique que calmatrip).
 */
export default function AuthShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="relative hidden overflow-hidden bg-[linear-gradient(175deg,#0C1A34_0%,#14284D_58%,#132752_100%)] px-14 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <svg
          className="pointer-events-none absolute -bottom-32 -left-32 h-[480px] w-[480px] text-[#B4894E] opacity-[.08]"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="1 5" />
          <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="1" />
        </svg>

        <Link href="/" className="relative flex items-center gap-3">
          <svg className="h-11 w-11 shrink-0" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="30" stroke="#4C79D4" strokeWidth="2" />
            <circle cx="32" cy="32" r="24.5" stroke="#B4894E" strokeWidth="1" strokeDasharray="2 3" opacity=".7" />
            <text x="32" y="40" textAnchor="middle" fontFamily="Spectral, serif" fontWeight="700" fontSize="24" fill="#fff">
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

        <div className="relative max-w-[38ch]">
          <span className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#8fb4ff]">
            <span className="h-0.5 w-5.5 rounded bg-[#8fb4ff]" />
            {eyebrow}
          </span>
          <p className="font-serif text-[26px] italic leading-snug text-white">{title}</p>
          <p className="mt-4 text-[14.5px] text-[#b9c8e4]">{subtitle}</p>
        </div>

        <p className="relative text-[13px] text-[#8093b5]">© 2026 Maître Makram Arfaoui</p>
      </div>

      <div className="flex items-center justify-center bg-mist px-6 py-14">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <svg className="h-9 w-9 shrink-0" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <circle cx="32" cy="32" r="30" stroke="#2456B8" strokeWidth="2" />
              <text x="32" y="40" textAnchor="middle" fontFamily="Spectral, serif" fontWeight="700" fontSize="24" fill="#14284D">
                MA
              </text>
            </svg>
            <span className="font-serif text-[17px] font-semibold text-navy">Maître Makram Arfaoui</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
