import Link from "next/link";
import BrandLogo from "@/views/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="bg-[#0b172c] text-slate-300">
      <div className="border-b border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { title: "Traductions certifiées", detail: "Cachet et signature officiels", icon: "M5 12l4 4L19 6" },
            { title: "Documents confidentiels", detail: "Stockage privé et accès sécurisé", icon: "M6 10V8a6 6 0 0 1 12 0v2M5 10h14v11H5V10Z" },
            { title: "Suivi en ligne", detail: "De la demande au téléchargement", icon: "M4 12h4l3 6 4-12 2 6h3" },
          ].map((item) => <div key={item.title} className="flex items-center gap-3 sm:justify-center"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-[#7da4ef]"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={item.icon} /></svg></span><span><span className="block text-[12.5px] font-semibold text-white">{item.title}</span><span className="block text-[10.5px] text-slate-400">{item.detail}</span></span></div>)}
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_.85fr_.85fr_1.1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3"><BrandLogo size="md" onDark /><span><span className="block font-serif text-[18px] font-semibold text-white">Makram Arfaoui</span><span className="block text-[9.5px] font-semibold uppercase tracking-[.14em] text-slate-400">Traducteur assermenté</span></span></Link>
            <p className="mt-5 max-w-[38ch] text-[13px] leading-6 text-slate-400">Traductions juridiques certifiées en français, arabe et anglais, destinées aux particuliers, entreprises et institutions.</p>
            <Link href="/commander" className="mt-5 inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#8fb4ff] hover:text-white">Demander un devis <span>→</span></Link>
          </div>
          <div><h2 className="mb-4 text-[11px] font-bold uppercase tracking-[.15em] text-white">Navigation</h2><ul className="grid gap-2.5 text-[12.5px] text-slate-400"><li><Link href="/a-propos" className="hover:text-white">Le cabinet</Link></li><li><Link href="/services" className="hover:text-white">Services</Link></li><li><Link href="/articles" className="hover:text-white">Articles</Link></li><li><Link href="/faq" className="hover:text-white">Questions fréquentes</Link></li></ul></div>
          <div><h2 className="mb-4 text-[11px] font-bold uppercase tracking-[.15em] text-white">Espace client</h2><ul className="grid gap-2.5 text-[12.5px] text-slate-400"><li><Link href="/commander" className="hover:text-white">Nouvelle commande</Link></li><li><Link href="/dashboard" className="hover:text-white">Tableau de bord</Link></li><li><Link href="/dashboard/orders" className="hover:text-white">Suivre une commande</Link></li><li><Link href="/dashboard/fichiers" className="hover:text-white">Mes documents</Link></li></ul></div>
          <div><h2 className="mb-4 text-[11px] font-bold uppercase tracking-[.15em] text-white">Contact</h2><address className="grid gap-3 text-[12.5px] not-italic text-slate-400"><a href="tel:+21622200170" className="flex items-start gap-2.5 hover:text-white"><span className="mt-0.5 text-[#8fb4ff]">T</span><span>(+216) 22 200 170<br />(+216) 51 100 036</span></a><a href="mailto:contact@makramarfaoui.com" className="flex items-center gap-2.5 hover:text-white"><span className="text-[#8fb4ff]">E</span><span className="break-all">contact@makramarfaoui.com</span></a><div className="flex items-start gap-2.5"><span className="text-[#8fb4ff]">A</span><span>17 Rue de Marseille<br />Tunis 1001, Tunisie</span></div></address></div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Maître Makram Arfaoui. Tous droits réservés.</span><span>Confidentialité · Paiement sécurisé · Documents protégés</span></div>
      </div>
    </footer>
  );
}
