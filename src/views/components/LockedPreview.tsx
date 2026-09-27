"use client";

import { useEffect, useState } from "react";

/**
 * Galerie d'aperçu filigrané — jamais le vrai fichier (voir /api/.../preview). Les
 * déterrents (menu contextuel désactivé, pas de drag, pas de bouton télécharger) découragent
 * la copie occasionnelle ; ils n'empêchent pas une capture d'écran, ce qu'aucune page web ne
 * peut techniquement garantir. La vraie protection est le filigrane + la basse résolution :
 * une capture ne vaut pas le fichier certifié.
 */
export default function LockedPreview({ orderId, documentId }: { orderId: string; documentId: string }) {
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function load() {
      setError(null);
      const res = await fetch(`/api/orders/${orderId}/documents/${documentId}/preview?page=${page}`);
      if (cancelled) return;

      if (!res.ok) {
        setError("Aperçu indisponible pour le moment.");
        return;
      }

      const count = Number(res.headers.get("X-Preview-Page-Count") ?? "1");
      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);
      setPageCount(count);
      setImageUrl(objectUrl);
    }

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [orderId, documentId, page]);

  return (
    <div>
      <div className="relative overflow-hidden rounded-[12px] border border-line bg-mist">
        <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-navy/90 px-3 py-1 text-[11.5px] font-semibold text-white">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
          Aperçu verrouillé
        </div>
        {error ? (
          <div className="flex h-[360px] items-center justify-center text-[13.5px] text-muted">{error}</div>
        ) : imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`Aperçu page ${page}`}
            className="w-full select-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          <div className="flex h-[360px] items-center justify-center text-[13.5px] text-muted">
            Chargement de l&apos;aperçu…
          </div>
        )}
      </div>

      {pageCount && pageCount > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3 text-[13.5px]">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-line px-3 py-1.5 font-semibold text-navy disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-muted">
            Page {page} / {pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-line px-3 py-1.5 font-semibold text-navy disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}

      <p className="mt-3 text-[12.5px] text-muted">
        Aperçu basse résolution et filigrané pour validation uniquement. Le fichier définitif se
        débloque au paiement du solde.
      </p>
    </div>
  );
}
