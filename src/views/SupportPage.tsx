import Link from "next/link";

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
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">Nous sommes disponibles</p>
      <h1 className="mb-2 text-[27px] text-navy sm:text-[30px]">Aide & contact</h1>
      <p className="mb-8 max-w-2xl text-[14px] leading-6 text-muted">
        Un souci avec une commande, un paiement ou votre document ? Contactez directement le
        cabinet — pensez à indiquer la référence de votre commande (ex. CMD-2026-XXXXX).
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CHANNELS.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="block rounded-2xl border border-[#e4e9f1] bg-white px-6 py-6 shadow-[0_8px_25px_rgba(20,40,77,0.04)] transition hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-[0_14px_35px_rgba(20,40,77,0.08)]"
          >
            <div className="mb-3.5 grid h-10.5 w-10.5 place-items-center rounded-[11px] bg-blue-soft text-blue-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {c.icon}
              </svg>
            </div>
            <h2 className="text-[15.5px] text-navy">{c.label}</h2>
            <div className="mt-1.5 text-[13.5px] text-muted">
              {c.lines.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-2 rounded-2xl border border-[#e4e9f1] bg-white p-6 text-[14px] shadow-[0_8px_25px_rgba(20,40,77,0.04)]">
        <p className="text-ink">
          Vous pouvez aussi consulter la{" "}
          <Link href="/faq" className="font-semibold text-blue hover:text-blue-2">
            FAQ
          </Link>{" "}
          ou la{" "}
          <Link href="/contact" className="font-semibold text-blue hover:text-blue-2">
            page contact
          </Link>{" "}
          du cabinet.
        </p>
      </div>
    </div>
  );
}
