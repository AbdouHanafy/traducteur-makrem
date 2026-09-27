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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <div
                  key={s.slug}
                  id={s.slug}
                  className="overflow-hidden rounded-[16px] border border-line bg-white shadow-[var(--shadow-md)]"
                >
                  {s.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imageUrl} alt={s.name} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="grid h-40 w-full place-items-center bg-[linear-gradient(135deg,#EDF0F5,#DCE3EE)]">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2456B8" strokeWidth="1.6">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <path d="M14 2v6h6M8 13h8M8 17h5" />
                      </svg>
                    </div>
                  )}
                  <div className="px-6 pb-7 pt-6">
                    <h2 className="text-[19px] text-navy">{s.name}</h2>
                    <p className="mt-2 text-[14.5px] text-muted">{s.description}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                      <span className="text-[13.5px] font-semibold text-muted">
                        {Number(s.pricePerPage) > 0 ? `À partir de ${s.pricePerPage} TND/page` : "Sur devis"}
                      </span>
                      <Link href="/commander" className="text-[13.5px] font-semibold text-blue hover:text-blue-2">
                        Commander →
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
