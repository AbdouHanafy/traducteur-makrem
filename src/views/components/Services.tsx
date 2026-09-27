import Link from "next/link";
import ServiceCard, { type ServiceCardData } from "@/views/components/ServiceCard";

/**
 * Section Services (home) — mêmes cartes que /services (voir ServiceCard.tsx), pour une
 * identité cohérente entre la page d'accueil et la page détail. Contenu géré depuis le
 * backoffice (/admin/services).
 */
export default function Services({ services }: { services: ServiceCardData[] }) {
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} anchor={false} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
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
