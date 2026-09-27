import Link from "next/link";

interface DocumentRow {
  id: string;
  kind: "SOURCE" | "TRANSLATED";
  originalName: string;
}

interface OrderWithDocuments {
  id: string;
  reference: string;
  service: { name: string };
  balancePaid: boolean;
  documents: DocumentRow[];
}

export default function FilesPage({ orders }: { orders: OrderWithDocuments[] }) {
  const ordersWithDocuments = orders.filter((o) => o.documents.length > 0);

  return (
    <div className="mx-auto max-w-[1050px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mb-8"><p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">Documents sécurisés</p><h1 className="text-[27px] text-navy sm:text-[30px]">Mes documents</h1><p className="mt-2 text-[13.5px] text-muted">Retrouvez vos fichiers sources et vos traductions certifiées.</p></div>

      {ordersWithDocuments.length === 0 ? (
        <div className="rounded-2xl border border-[#e4e9f1] bg-white p-12 text-center text-muted shadow-[0_8px_25px_rgba(20,40,77,0.04)]">
          Aucun fichier pour l&apos;instant.
        </div>
      ) : (
        <div className="grid gap-4">
          {ordersWithDocuments.map((order) => {
            const sourceDoc = order.documents.find((d) => d.kind === "SOURCE");
            const translatedDoc = order.documents.find((d) => d.kind === "TRANSLATED");
            return (
              <div key={order.id} className="rounded-2xl border border-[#e4e9f1] bg-white p-6 shadow-[0_8px_25px_rgba(20,40,77,0.04)]">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-serif text-[16.5px] text-navy">{order.reference}</div>
                    <div className="text-[13px] text-muted">{order.service.name}</div>
                  </div>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-[13px] font-semibold text-blue hover:text-blue-2"
                  >
                    Voir la commande
                  </Link>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {sourceDoc && (
                    <a
                      href={`/api/orders/${order.id}/documents/${sourceDoc.id}/download`}
                      className="flex items-center gap-3 rounded-[10px] border border-line bg-mist px-4 py-3 text-[13.5px] font-medium text-ink transition-colors hover:border-blue"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-blue-2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                      <span className="min-w-0 truncate">Document source — {sourceDoc.originalName}</span>
                    </a>
                  )}

                  {translatedDoc &&
                    (order.balancePaid ? (
                      <a
                        href={`/api/orders/${order.id}/documents/${translatedDoc.id}/download`}
                        className="flex items-center gap-3 rounded-[10px] border border-line bg-mist px-4 py-3 text-[13.5px] font-medium text-ink transition-colors hover:border-blue"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-ok">
                          <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
                        </svg>
                        <span className="min-w-0 truncate">Traduction certifiée — {translatedDoc.originalName}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 rounded-[10px] border border-dashed border-line bg-mist px-4 py-3 text-[13.5px] text-muted">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
                          <rect x="4" y="10" width="16" height="10" rx="2" />
                          <path d="M8 10V7a4 4 0 118 0v3" />
                        </svg>
                        Traduction verrouillée — solde à régler
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
