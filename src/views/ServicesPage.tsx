import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import ServiceCard, { type ServiceCardData } from "@/views/components/ServiceCard";
import PublicPageHero from "@/views/components/PublicPageHero";

export default function ServicesPage({ services }: { services: ServiceCardData[] }) {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <PublicPageHero eyebrow="Nos services" title="Traductions juridiques assermentées, par type de document" description="Chaque traduction est certifiée conforme, cachetée et signée — pour vos démarches auprès des administrations, ambassades, universités et tribunaux." />

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s.slug} service={s} />
              ))}
            </div>

            <div className="mt-14 rounded-[20px] border border-line bg-white px-6 py-9 text-center shadow-[0_10px_35px_rgba(20,40,77,0.05)] sm:px-8">
              <h2 className="text-[24px] text-navy">Un document qui n&apos;est pas dans la liste ?</h2>
              <p className="mx-auto mt-2.5 max-w-[56ch] text-[15px] text-muted">
                Nous traduisons la quasi-totalité des documents officiels. Déposez votre
                fichier ou contactez-nous, un devis vous sera communiqué avant tout engagement.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3.5">
                <Link
                  href="/commander"
                  className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-[24px] py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-blue-2"
                >
                  Commander une traduction
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-[11px] border-[1.5px] border-line px-[24px] py-[13px] text-[15px] font-semibold text-navy transition-colors hover:border-navy"
                >
                  Nous contacter
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
