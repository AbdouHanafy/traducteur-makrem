"use client";

import { useEffect } from "react";

export default function RouteErrorFallback({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Route rendering failed", { error, digest: error.digest });
  }, [error]);

  return (
    <main className="grid min-h-[65vh] place-items-center px-6 py-16" role="alert">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-paper p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-danger">Erreur inattendue</p>
        <h1 className="mt-3 font-serif text-3xl text-navy">Cette page ne peut pas être affichée.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Réessayez dans un instant. Si le problème persiste, contactez le cabinet.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-6 rounded-xl bg-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          Réessayer
        </button>
      </div>
    </main>
  );
}
