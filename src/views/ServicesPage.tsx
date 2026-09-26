import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import { SERVICES } from "@/views/data/services";

export default function ServicesPage() {
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
              {SERVICES.map((s) => (
                <div
                  key={s.slug}
                  id={s.slug}
                  className="rounded-[16px] border border-line bg-white px-6 pb-7 pt-7 shadow-[var(--shadow-md)]"
                >
                  <div className="mb-4 grid h-11.5 w-11.5 place-items-center rounded-[11px] bg-blue-soft text-blue-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      {s.icon}
                    </svg>
                  </div>
                  <h2 className="text-[19px] text-navy">{s.title}</h2>
                  <p className="mt-2 text-[14.5px] text-muted">{s.description}</p>
                  <ul className="mt-4 grid gap-1.5 border-t border-line pt-4 text-[13.5px] text-ink">
                    {s.documents.map((d) => (
                      <li key={d} className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E9E6A" strokeWidth="2.5" className="shrink-0">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                    <span className="text-[13.5px] font-semibold text-muted">Sur devis</span>
                    <Link href="/commander" className="text-[13.5px] font-semibold text-blue hover:text-blue-2">
                      Commander →
                    </Link>
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
