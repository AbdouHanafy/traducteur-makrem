import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";

const VALUES = [
  {
    title: "Rigueur",
    desc: "Chaque traduction est relue et confrontée au document source avant certification.",
  },
  {
    title: "Confidentialité",
    desc: "Vos documents sont des actes personnels — traités et stockés en conséquence.",
  },
  {
    title: "Reconnaissance officielle",
    desc: "Traductions assermenties, cachetées et signées, acceptées par les administrations.",
  },
  {
    title: "Délais tenus",
    desc: "Un délai est annoncé au devis et respecté, avec suivi de commande en ligne.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <section className="bg-[linear-gradient(180deg,#0C1A34_0%,#14284D_100%)] py-18 text-white">
          <div className="mx-auto max-w-[1160px] px-[22px]">
            <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#8fb4ff]">
              <span className="h-0.5 w-5.5 rounded bg-[#8fb4ff]" />
              À propos
            </span>
            <h1 className="max-w-[26ch] text-[clamp(30px,4vw,44px)] text-white">
              Maître Makram Arfaoui, traducteur &amp; interprète assermenté
            </h1>
            <p className="mt-4 max-w-[62ch] text-[17px] text-[#c4d2ea]">
              Traducteur assermenté près la Cour d&apos;appel de Tunis, intervenant pour les
              particuliers, entreprises, administrations et institutions judiciaires.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto grid max-w-[1160px] gap-14 px-[22px] md:grid-cols-[1.1fr_.9fr]">
            <div>
              <h2 className="text-[26px] text-navy">Un interlocuteur unique, du dépôt à la livraison</h2>
              <p className="mt-4 text-[15.5px] leading-relaxed text-muted">
                En qualité de traducteur et interprète assermenté, j&apos;interviens en français,
                arabe et anglais pour la traduction de documents officiels destinés aux
                démarches administratives, judiciaires, académiques et notariales.
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-muted">
                Chaque traduction est certifiée conforme à l&apos;original, revêtue du cachet et de
                la signature du traducteur assermenté, et engageant sa responsabilité — un gage
                de fiabilité exigé par les administrations, ambassades et tribunaux.
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-muted">
                Au-delà de la traduction écrite, j&apos;assure également des missions
                d&apos;interprétariat assermenté : mariages mixtes, audiences, actes notariés et
                rendez-vous administratifs.
              </p>
            </div>

            <div className="rounded-[16px] border border-line bg-white p-7">
              <h3 className="text-[17px] text-navy">En pratique</h3>
              <dl className="mt-4 grid gap-4 text-[14.5px]">
                <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                  <dt className="text-muted">Statut</dt>
                  <dd className="text-right font-medium text-ink">
                    Traducteur &amp; interprète assermenté
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                  <dt className="text-muted">Juridiction</dt>
                  <dd className="text-right font-medium text-ink">Cour d&apos;appel de Tunis</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                  <dt className="text-muted">Langues de travail</dt>
                  <dd className="text-right font-medium text-ink">Français · Arabe · Anglais</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">Cabinet</dt>
                  <dd className="text-right font-medium text-ink">
                    17 Rue de Marseille, Tunis 1001
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="bg-white py-18">
          <div className="mx-auto max-w-[1160px] px-[22px]">
            <div className="mb-11 max-w-[660px]">
              <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-blue">
                <span className="h-0.5 w-5.5 rounded bg-blue" />
                Nos engagements
              </span>
              <h2 className="text-[clamp(26px,3vw,34px)] text-navy">
                Ce qui encadre chaque traduction
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-[14px] border border-line px-5 py-6">
                  <h3 className="text-[16.5px] text-navy">{v.title}</h3>
                  <p className="mt-2 text-[13.5px] text-muted">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[1160px] px-[22px] text-center">
            <h2 className="text-[24px] text-navy">Une traduction à faire certifier ?</h2>
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
        </section>
      </main>
      <Footer />
    </>
  );
}
