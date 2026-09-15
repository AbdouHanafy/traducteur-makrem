/**
 * Section Services — contenu encore statique (placeholder de copywriting), volontairement
 * SANS prix : les tarifs sont interdits en dur côté frontend (voir ARCHITECTURE.md §1.2 /
 * §5, anti-pattern identifié dans le prototype). À partir de la Phase 3, cette section lira
 * `Service`/`PricingRule` via `src/repositories/services.ts` et un GET /api/services.
 */
const SERVICES = [
  {
    title: "Actes d'état civil",
    description: "Extraits de naissance, mariage, décès, livret de famille.",
    icon: (
      <path d="M12 2l3 6 6 .9-4.5 4.3L18 20l-6-3.2L6 20l1.5-6.8L3 8.9 9 8z" />
    ),
  },
  {
    title: "Diplômes & relevés de notes",
    description: "Diplômes, attestations, relevés de notes pour études à l'étranger.",
    icon: (
      <>
        <path d="M22 10L12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" />
      </>
    ),
  },
  {
    title: "Contrats & actes",
    description: "Contrats commerciaux, statuts, procurations, actes notariés.",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" />
      </>
    ),
  },
  {
    title: "Documents judiciaires",
    description: "Jugements, assignations, PV, décisions de tribunaux.",
    icon: (
      <path d="M12 3v18M5 7l7-4 7 4M4 21h16M6 7l-2 6h4zM18 7l-2 6h4z" />
    ),
  },
  {
    title: "Immigration & visa",
    description: "Dossiers de visa, résidence, casier judiciaire, attestations.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
      </>
    ),
  },
  {
    title: "Interprétariat",
    description: "Interprète assermenté : mariages, tribunaux, notaires, rendez-vous.",
    icon: (
      <>
        <path d="M3 5h12v9H8l-4 4V5zM21 9v11l-4-4h-2" />
      </>
    ),
  },
];

export default function Services() {
  return (
    <section id="services" className="py-22">
      <div className="mx-auto max-w-[1160px] px-[22px]">
        <div className="mb-11 max-w-[660px]">
          <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-blue">
            <span className="h-0.5 w-5.5 rounded bg-blue" />
            Nos prestations
          </span>
          <h2 className="text-[clamp(28px,3.4vw,40px)] text-navy">
            Des traductions officielles pour chaque démarche
          </h2>
          <p className="mt-3.5 text-[17px] text-muted">
            Traductions assermentées, cachetées, destinées aux administrations, universités,
            ambassades et tribunaux.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="group relative rounded-[14px] border border-line bg-white px-6 pb-6 pt-6.5 transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-[var(--shadow-md)]"
            >
              <div className="mb-4 grid h-11.5 w-11.5 place-items-center rounded-[11px] bg-blue-soft text-blue-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {s.icon}
                </svg>
              </div>
              <h3 className="text-[19px] text-navy">{s.title}</h3>
              <p className="mt-2 text-[14.5px] text-muted">{s.description}</p>
              <div className="mt-4 text-[13.5px] font-semibold text-muted">Sur devis</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] text-muted">
          Le prix dépend de la langue, du nombre de pages, du délai et de la complexité —
          devis exact en ligne après dépôt du document.
        </p>
      </div>
    </section>
  );
}
