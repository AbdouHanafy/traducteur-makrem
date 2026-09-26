/**
 * Workflow — le "paiement en deux temps" reste le bon modèle mental
 * (ARCHITECTURE.md §1.1), présenté ici comme une vraie ligne du temps reliée
 * plutôt qu'une grille de cartes égales. Purement présentationnel ; le vrai
 * parcours vit dans /commander et /dashboard.
 */
const STEPS = [
  { title: "Déposez le document", desc: "Téléversez votre fichier et indiquez la langue et le délai souhaités." },
  { title: "Recevez le devis", desc: "Prix calculé automatiquement, validé par le traducteur." },
  { title: "Réglez l'avance", desc: "50 % à la commande pour lancer le travail.", tag: "Acompte 50 %", pay: true },
  { title: "Traduction & livraison", desc: "Le traducteur dépose le fichier certifié dans votre espace.", tag: "🔒 Verrouillé" },
  { title: "Solde & téléchargement", desc: "Payez les 50 % restants : le fichier se débloque instantanément.", tag: "🔓 Débloqué", pay: true },
];

export default function Workflow() {
  return (
    <section id="workflow" className="relative overflow-hidden bg-navy py-22 text-white">
      <svg
        className="pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] text-white opacity-[.04]"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" />
      </svg>

      <div className="relative mx-auto max-w-[1160px] px-[22px]">
        <div className="mb-16 max-w-[660px]">
          <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#8fb4ff]">
            <span className="h-0.5 w-5.5 rounded bg-[#8fb4ff]" />
            Comment ça marche
          </span>
          <h2 className="text-[clamp(28px,3.4vw,40px)] text-white">
            Un paiement en deux temps, simple et sécurisé
          </h2>
          <p className="mt-3.5 text-[17px] text-[#b9c8e4]">
            Vous réglez 50 % pour lancer la traduction. Le fichier final vous est livré —
            verrouillé. Il se débloque et devient téléchargeable dès le paiement du solde.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          <div
            className="absolute left-0 right-0 top-[19px] hidden lg:block"
            style={{
              height: 1,
              background:
                "repeating-linear-gradient(to right, rgba(255,255,255,.22) 0 10px, transparent 10px 18px)",
            }}
            aria-hidden="true"
          />
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <div
                className={`relative z-10 mb-5 grid h-9.5 w-9.5 place-items-center rounded-full border-2 font-serif text-[15px] font-semibold ${
                  step.pay
                    ? "border-ok bg-ok text-white"
                    : "border-white/25 bg-navy text-white"
                }`}
              >
                {`0${i + 1}`}
              </div>
              <h4 className="text-[16.5px] text-white">{step.title}</h4>
              <p className="mt-2 max-w-[26ch] text-[13.5px] text-[#a9bbdb]">{step.desc}</p>
              {step.tag && (
                <span
                  className={`mt-3.5 inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-[11.5px] font-semibold ${
                    step.pay ? "bg-[rgba(30,158,106,.16)] text-[#7ce0b1]" : "bg-white/10 text-[#cfd9ee]"
                  }`}
                >
                  {step.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
