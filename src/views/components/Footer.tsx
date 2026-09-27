import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="bg-navy-2 py-16 text-[#c9d5ea]">
      <div className="mx-auto max-w-[1160px] px-[22px]">
        <div className="grid grid-cols-1 gap-9 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="font-serif text-xl font-semibold text-white">Maître Makram Arfaoui</div>
            <p className="mt-3 max-w-[34ch] text-[13.5px] text-[#a9bbdb]">
              Traducteur &amp; interprète assermenté. Traductions juridiques certifiées,
              reconnues par les administrations et institutions.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] font-semibold text-white">Services</h4>
            <ul className="grid gap-2.5 text-sm">
              <li><Link href="/services#etat-civil" className="hover:text-white">État civil</Link></li>
              <li><Link href="/services#diplomes-releves" className="hover:text-white">Diplômes &amp; relevés</Link></li>
              <li><Link href="/services#contrats-actes" className="hover:text-white">Contrats &amp; actes</Link></li>
              <li><Link href="/services#documents-judiciaires" className="hover:text-white">Documents judiciaires</Link></li>
              <li><Link href="/services#interpretariat" className="hover:text-white">Interprétariat</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] font-semibold text-white">Liens</h4>
            <ul className="grid gap-2.5 text-sm">
              <li><Link href="/a-propos" className="hover:text-white">À propos</Link></li>
              <li><Link href="/#workflow" className="hover:text-white">Comment ça marche</Link></li>
              <li><Link href="/commander" className="hover:text-white">Commander</Link></li>
              <li><Link href="/dashboard/orders" className="hover:text-white">Suivi de commande</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] font-semibold text-white">Contact</h4>
            <div className="grid gap-3 text-sm">
              <div>(+216) 22 200 170<br />(+216) 51 100 036</div>
              <div>contact@makramarfaoui.com</div>
              <div>17 Rue de Marseille,<br />Tunis 1001, Tunisie</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-5 text-[12.5px] text-[#8093b5]">
          <span>© 2026 Maître Makram Arfaoui — Tous droits réservés.</span>
          <span>Plateforme en développement</span>
        </div>
      </div>
    </footer>
  );
}
