import Link from "next/link";

export default function NotFoundFallback() {
  return (
    <main className="grid min-h-[65vh] place-items-center px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-paper p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue">Erreur 404</p>
        <h1 className="mt-3 font-serif text-3xl text-navy">Page introuvable</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Cette adresse n’existe pas ou la ressource a été déplacée.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
