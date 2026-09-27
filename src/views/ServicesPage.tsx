import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";

export interface ServiceDetailItem {
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  pricePerPage: string;
}

export default function ServicesPage({ services }: { services: ServiceDetailItem[] }) {
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
                <div
                  key={s.slug}
                  id={s.slug}
                  className="group flex flex-col overflow-hidden rounded-[18px] border border-line bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[var(--shadow-lg)]"
                >
                  <div className="relative h-48 w-full shrink-0 overflow-hidden">
                    {s.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.imageUrl}
                        alt={s.name}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#EDF0F5,#DCE3EE)]">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2456B8" strokeWidth="1.6">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <path d="M14 2v6h6M8 13h8M8 17h5" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,26,52,0)_45%,rgba(12,26,52,.82)_100%)]" />
                    <h2 className="absolute inset-x-0 bottom-0 px-5 pb-4 font-serif text-[20px] leading-tight text-white [text-shadow:0_1px_6px_rgba(0,0,0,.35)]">
                      {s.name}
                    </h2>
                  </div>

                  <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                    <p className="flex-1 text-[14.5px] leading-relaxed text-muted">{s.description}</p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                      <span className="inline-flex items-center rounded-full bg-blue-soft px-3 py-1.5 text-[12.5px] font-semibold text-blue-2">
                        {Number(s.pricePerPage) > 0 ? `Dès ${s.pricePerPage} TND/page` : "Sur devis"}
                      </span>
                      <Link
                        href="/commander"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-navy px-4 py-2.5 text-[13px] font-semibold text-white transition-colors group-hover:bg-blue"
                      >
                        Commander
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
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
