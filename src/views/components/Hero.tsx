import Link from "next/link";

/**
 * Hero — reprend le concept visuel de la maquette (document source → document traduit +
 * sceau + badge "débloqué au paiement"), voir ARCHITECTURE.md §1.1. Pas de promesse
 * juridique non vérifiée ("accepté partout" etc., cf. brief §4) : le texte reste factuel.
 */
export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#0C1A34_0%,#14284D_62%,#16294f_100%)] pb-24 pt-14 text-white"
    >
      <div className="mx-auto grid max-w-[1160px] items-center gap-14 px-[22px] md:grid-cols-[1.08fr_.92fr]">
        <div>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[.16] bg-white/[.08] px-3.5 py-1.5 text-[13px] font-medium text-[#dbe6f8]">
            <span className="h-1.5 w-1.5 rounded-full bg-ok shadow-[0_0_0_4px_rgba(30,158,106,.25)]" />
            Traducteur assermenté près la Cour d&apos;appel de Tunis
          </span>
          <h1 className="text-[clamp(34px,4.6vw,56px)] font-semibold tracking-tight text-white">
            Vos traductions juridiques{" "}
            <span className="font-medium italic text-[#9fc0ff]">certifiées</span>, commandées et
            livrées en ligne.
          </h1>
          <p className="mt-5 max-w-[47ch] text-lg text-[#c4d2ea]">
            Diplômes, actes d&apos;état civil, contrats, jugements… Déposez votre document,
            recevez un devis, et récupérez votre traduction officielle sans vous déplacer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/commander"
              className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-[26px] py-[15px] text-base font-semibold text-white shadow-[0_8px_22px_rgba(36,86,184,.28)] transition-colors hover:bg-blue-2"
            >
              Commander une traduction
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link
              href="/#services"
              className="inline-flex items-center rounded-[11px] border-[1.5px] border-white/[.28] px-[26px] py-[15px] text-base font-semibold text-white transition-colors hover:border-white"
            >
              Découvrir nos services
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-8 gap-y-5 border-t border-white/[.12] pt-6">
            <div className="flex items-center gap-2.5 text-[13.5px] text-[#b9c8e4]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ce0b1" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Traductions reconnues officiellement
            </div>
            <div className="flex items-center gap-2.5 text-[13.5px] text-[#b9c8e4]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8fb4ff" strokeWidth="2">
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
              Documents confidentiels &amp; sécurisés
            </div>
            <div className="flex items-center gap-2.5 text-[13.5px] text-[#b9c8e4]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0c27a" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              Livraison rapide, suivi en ligne
            </div>
          </div>
        </div>

        <div className="relative hidden h-[420px] md:block" aria-hidden="true">
          <div className="absolute right-24 top-[52px] h-[330px] w-[250px] rotate-[-7deg] overflow-hidden rounded-xl bg-white text-ink opacity-55 shadow-[var(--shadow-lg)] saturate-[.8]">
            <div className="border-b border-line px-[22px] pb-3 pt-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue">
                Document source
              </div>
              <div className="mt-1 font-serif text-[15px] font-semibold">الشهادة الأصلية</div>
            </div>
            <div className="grid gap-2.5 px-[22px] py-4.5">
              {[100, 88, 72, 100, 88].map((w, i) => (
                <span key={i} className="block h-2 rounded bg-[#e7ecf4]" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>

          <div className="absolute right-3.5 top-5 h-[372px] w-[288px] rotate-[4deg] overflow-hidden rounded-xl bg-white text-ink shadow-[var(--shadow-lg)]">
            <div className="border-b border-line px-[22px] pb-3 pt-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue">
                Traduction certifiée
              </div>
              <div className="mt-1 font-serif text-[15px] font-semibold">Extrait de naissance</div>
            </div>
            <div className="grid gap-2.5 px-[22px] py-4.5">
              {[100, 88, 72, 100, 88, 72].map((w, i) => (
                <span key={i} className="block h-2 rounded bg-[#e7ecf4]" style={{ width: `${w}%` }} />
              ))}
            </div>
            <svg className="absolute bottom-[18px] right-5 h-24 w-24 rotate-[-12deg]" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#2456B8" strokeWidth="3" />
              <circle cx="60" cy="60" r="44" fill="none" stroke="#2456B8" strokeWidth="1.2" />
              <path id="ct" d="M60,60 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" fill="none" />
              <text fontFamily="Inter" fontSize="9.5" fontWeight="700" fill="#2456B8" letterSpacing="1.2">
                <textPath href="#ct" startOffset="4%">
                  • TRADUCTEUR ASSERMENTÉ • TUNIS •
                </textPath>
              </text>
              <text x="60" y="57" textAnchor="middle" fontFamily="Spectral" fontWeight="700" fontSize="20" fill="#14284D">
                MA
              </text>
              <text x="60" y="72" textAnchor="middle" fontFamily="Inter" fontSize="7" fill="#2456B8" letterSpacing="1">
                CERTIFIÉ
              </text>
            </svg>
          </div>

          <div className="absolute -left-4 top-[120px] flex -rotate-3 items-center gap-2.5 rounded-xl bg-white px-3.5 py-3 text-navy shadow-[var(--shadow-md)]">
            <div className="grid h-8.5 w-8.5 place-items-center rounded-[9px] bg-ok-soft text-ok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <b className="block text-[13px]">Conforme &amp; signée</b>
              <span className="text-[11px] text-muted">Cachet officiel apposé</span>
            </div>
          </div>

          <div className="absolute -bottom-1.5 -right-2 flex items-center gap-2.5 rounded-xl bg-navy px-3.5 py-2.5 text-[12.5px] font-semibold text-white shadow-[var(--shadow-md)]">
            <div className="grid h-7.5 w-7.5 place-items-center rounded-lg bg-white/[.12]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
            </div>
            Débloqué au paiement
          </div>
        </div>
      </div>
    </section>
  );
}
