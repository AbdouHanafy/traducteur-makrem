import Link from "next/link";

export interface ServiceTeaserItem {
  slug: string;
  name: string;
  description: string;
}

/**
 * Section Services — présentation éditoriale (liste numérotée façon sommaire d'acte) plutôt
 * qu'une grille d'icônes générique. Contenu géré depuis le backoffice (/admin/services), plus
 * aucune donnée en dur ici.
 */
export default function Services({ services }: { services: ServiceTeaserItem[] }) {
  return (
    <section id="services" className="py-22">
      <div className="mx-auto max-w-[1160px] px-[22px]">
        <div className="mb-14 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-[660px]">
            <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-blue">
              <span className="h-0.5 w-5.5 rounded bg-blue" />
              Nos prestations
            </span>
            <h2 className="text-[clamp(28px,3.4vw,40px)] text-navy">
              Des traductions officielles pour chaque démarche
            </h2>
          </div>
          <p className="max-w-[34ch] text-[14.5px] text-muted md:text-right">
            Traductions assermentées, cachetées, destinées aux administrations, universités,
            ambassades et tribunaux.
          </p>
        </div>

        <div className="border-t border-line">
          {services.map((s, i) => (
            <Link
              key={s.slug}
              href={`/services#${s.slug}`}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-line py-6 transition-colors hover:bg-blue-soft/40 sm:gap-8 sm:py-7"
            >
              <span className="font-serif text-[15px] text-muted transition-colors group-hover:text-seal sm:text-[17px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="block font-serif text-[19px] text-navy transition-transform group-hover:translate-x-1 sm:text-[22px]">
                  {s.name}
                </span>
                <span className="mt-1 block max-w-[52ch] text-[13.5px] text-muted sm:text-[14.5px]">
                  {s.description}
                </span>
              </span>
              <span className="flex items-center gap-3 whitespace-nowrap">
                <span className="hidden text-[13px] font-semibold uppercase tracking-wide text-muted sm:inline">
                  Sur devis
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className="text-blue transition-transform group-hover:translate-x-1"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[13px] text-muted">
            Le prix dépend de la langue, du nombre de pages, du délai et de la complexité.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-blue hover:text-blue-2"
          >
            Voir le détail de tous nos services
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
