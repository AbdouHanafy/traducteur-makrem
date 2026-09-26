import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";

const CHANNELS = [
  {
    label: "Téléphone",
    lines: ["(+216) 22 200 170", "(+216) 51 100 036"],
    href: "tel:+21622200170",
    icon: (
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.68 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0122 16.92z" />
    ),
  },
  {
    label: "Email",
    lines: ["contact@makramarfaoui.com"],
    href: "mailto:contact@makramarfaoui.com",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </>
    ),
  },
  {
    label: "Cabinet",
    lines: ["17 Rue de Marseille", "Tunis 1001, Tunisie"],
    href: undefined,
    icon: (
      <>
        <path d="M12 21s-7-6.5-7-11a7 7 0 0114 0c0 4.5-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  },
];

export default function ContactPage() {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <section className="bg-[linear-gradient(180deg,#0C1A34_0%,#14284D_100%)] py-18 text-white">
          <div className="mx-auto max-w-[1160px] px-[22px]">
            <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#8fb4ff]">
              <span className="h-0.5 w-5.5 rounded bg-[#8fb4ff]" />
              Contact
            </span>
            <h1 className="max-w-[24ch] text-[clamp(30px,4vw,44px)] text-white">
              Une question avant de commander ?
            </h1>
            <p className="mt-4 max-w-[62ch] text-[17px] text-[#c4d2ea]">
              Appelez-nous, écrivez-nous ou passez au cabinet. Pour une traduction, le plus
              rapide reste de déposer directement votre document et de recevoir un devis en
              ligne.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-[1160px] px-[22px]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {CHANNELS.map((c) => {
                const cardClass =
                  "block rounded-[14px] border border-line bg-white px-6 py-7 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]";
                const content = (
                  <>
                    <div className="mb-4 grid h-11.5 w-11.5 place-items-center rounded-[11px] bg-blue-soft text-blue-2">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        {c.icon}
                      </svg>
                    </div>
                    <h2 className="text-[16.5px] text-navy">{c.label}</h2>
                    <div className="mt-2 text-[14.5px] text-muted">
                      {c.lines.map((l) => (
                        <div key={l}>{l}</div>
                      ))}
                    </div>
                  </>
                );
                return c.href ? (
                  <Link key={c.label} href={c.href} className={cardClass}>
                    {content}
                  </Link>
                ) : (
                  <div key={c.label} className={cardClass}>
                    {content}
                  </div>
                );
              })}
            </div>

            <div className="mt-14 grid gap-8 rounded-[16px] border border-line bg-white px-8 py-9 md:grid-cols-[1.2fr_.8fr] md:items-center">
              <div>
                <h2 className="text-[22px] text-navy">Prêt à faire traduire votre document ?</h2>
                <p className="mt-2.5 max-w-[56ch] text-[15px] text-muted">
                  Déposez votre fichier en ligne, indiquez la langue et le délai souhaités : un
                  devis vous est communiqué avant tout engagement.
                </p>
              </div>
              <div className="flex flex-wrap gap-3.5 md:justify-end">
                <Link
                  href="/commander"
                  className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-[24px] py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-blue-2"
                >
                  Commander une traduction
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
