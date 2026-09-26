import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";

const FAQS = [
  {
    q: "Une traduction assermentée est-elle acceptée par toutes les administrations ?",
    a: "Une traduction assermentée est certifiée conforme à l'original, cachetée et signée par un traducteur assermenté. Elle est reconnue par les administrations tunisiennes, ambassades, universités et tribunaux. En cas de doute sur un dossier précis, l'organisme destinataire reste la référence sur ses propres exigences.",
  },
  {
    q: "Comment le prix est-il calculé ?",
    a: "Le prix dépend du type de document, de la paire de langues, du nombre de pages et du délai souhaité. Aucun prix n'est fixé à l'avance sur le site : un devis exact est communiqué après dépôt du document, avant tout engagement.",
  },
  {
    q: "Comment se déroule le paiement ?",
    a: "Le paiement se fait en deux temps : un acompte de 50 % au lancement de la traduction, puis le solde de 50 % une fois la traduction terminée. Le fichier final est livré verrouillé et se débloque au paiement du solde.",
  },
  {
    q: "Mes documents sont-ils confidentiels ?",
    a: "Oui. Les documents déposés sont des actes personnels et sont traités comme tels : accès restreint, aucune diffusion publique, et suppression selon la politique de conservation du cabinet.",
  },
  {
    q: "Quels formats de fichiers sont acceptés ?",
    a: "Les formats courants sont acceptés : PDF, JPEG, PNG, ainsi que les scans de bonne qualité. Un document illisible peut retarder l'établissement du devis.",
  },
  {
    q: "Combien de temps prend une traduction ?",
    a: "Le délai dépend du volume et de la complexité du document ainsi que du type de délai choisi (standard, express, urgent). Le délai précis est communiqué avec le devis et suivi en ligne depuis votre espace client.",
  },
  {
    q: "Puis-je suivre ma commande en ligne ?",
    a: "Oui, chaque commande dispose d'un espace de suivi indiquant l'étape en cours : devis, acompte, traduction en cours, fichier prêt, solde, téléchargement.",
  },
  {
    q: "Proposez-vous aussi de l'interprétariat ?",
    a: "Oui, pour les mariages mixtes, audiences, actes notariés et rendez-vous administratifs nécessitant un interprète assermenté.",
  },
];

export default function FaqPage() {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <section className="bg-[linear-gradient(180deg,#0C1A34_0%,#14284D_100%)] py-18 text-white">
          <div className="mx-auto max-w-[1160px] px-[22px]">
            <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#8fb4ff]">
              <span className="h-0.5 w-5.5 rounded bg-[#8fb4ff]" />
              FAQ
            </span>
            <h1 className="max-w-[24ch] text-[clamp(30px,4vw,44px)] text-white">
              Questions fréquentes
            </h1>
            <p className="mt-4 max-w-[62ch] text-[17px] text-[#c4d2ea]">
              Tout ce qu&apos;il faut savoir avant de commander une traduction assermentée.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-[820px] px-[22px]">
            <div className="grid gap-3">
              {FAQS.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-[14px] border border-line bg-white px-5 py-4 open:shadow-[var(--shadow-sm)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-navy marker:content-none">
                    {item.q}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      className="shrink-0 text-blue transition-transform group-open:rotate-45"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>

            <div className="mt-14 rounded-[16px] border border-line bg-white px-8 py-9 text-center">
              <h2 className="text-[22px] text-navy">Une autre question ?</h2>
              <p className="mx-auto mt-2.5 max-w-[48ch] text-[15px] text-muted">
                Contactez-nous directement, nous répondons rapidement.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3.5">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-[24px] py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-blue-2"
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
