import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import ServiceCard, { type ServiceCardData } from "@/views/components/ServiceCard";

export default function ServicesPage({ services }: { services: ServiceCardData[] }) {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <section className="bg-[linear-gradient(180deg,#0C1A34_0%,#14284D_100%)] py-18 text-white">
          <div className="mx-auto max-w-[1160px] px-[22px]">
            <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#8fb4ff]">
              <span className="h-0.5 w-5.5 rounded bg-[#8fb4ff]" />
              Nos services
            </span>
            <h1 className="max-w-[24ch] text-[clamp(30px,4vw,44px)] text-white">
              Traductions juridiques assermentées, par type de document
            </h1>
            <p className="mt-4 max-w-[62ch] text-[17px] text-[#c4d2ea]">
              Chaque traduction est certifiée conforme, cachetée et signée par un traducteur
              assermenté — reconnue par les administrations, ambassades, universités et
              tribunaux.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-[1160px] px-[22px]">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s.slug} service={s} />
              ))}
            </div>

            <div className="mt-14 rounded-[16px] border border-line bg-white px-8 py-9 text-center">
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
