"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedPreview from "@/views/components/ProtectedPreview";
import { getDateLocale } from "@/lib/i18n";
import { useI18n } from "@/views/components/I18nProvider";

export interface OrderDetailData {
  id: string;
  reference: string;
  status: string;
  sourceLang: string;
  targetLang: string;
  pages: number;
  destinationCountry: string;
  receivingAuthority: string | null;
  purpose: string;
  certificationNeeds: string;
  deliveryMethod: string;
  deliveryAddress: string | null;
  clientNotes: string | null;
  totalAmount: string;
  advanceAmount: string;
  balanceAmount: string;
  advancePaid: boolean;
  balancePaid: boolean;
  previewViewed: boolean;
  advanceInPerson: boolean;
  revisionRequested: boolean;
  service: { name: string };
  documents: { id: string; kind: "SOURCE" | "TRANSLATED"; originalName: string }[];
  statusHistory: { status: string; createdAt: string }[];
}

export default function OrderDetailPage({ order }: { order: OrderDetailData }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewed, setViewed] = useState(order.previewViewed);
  const [previewUnavailable, setPreviewUnavailable] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [revisionSent, setRevisionSent] = useState(false);
  const markViewed = useCallback(() => setViewed(true), []);
  const markUnavailable = useCallback(() => setPreviewUnavailable(true), []);

  const sourceDoc = order.documents.find((d) => d.kind === "SOURCE");
  const translatedDoc = order.documents.find((d) => d.kind === "TRANSLATED");

  async function acceptQuote() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${order.id}/accept-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expectedTotal: order.totalAmount }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.code === "QUOTE_CHANGED" ? t("app.order.quoteChanged") : t("app.order.errAccept"));
      // Le devis a changé : on recharge pour afficher le nouveau montant avant toute acceptation.
      if (data?.code === "QUOTE_CHANGED") router.refresh();
      return;
    }
    router.refresh();
  }

  async function sendRevision(event: React.FormEvent) {
    event.preventDefault();
    if (revisionNote.trim().length < 5) {
      setError(t("app.revision.errNote"));
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${order.id}/revision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: revisionNote }),
    });
    setLoading(false);
    if (!res.ok) {
      setError(t("app.revision.errGeneric"));
      return;
    }
    setRevisionSent(true);
    setRevisionOpen(false);
    router.refresh();
  }

  async function pay(phase: "advance" | "balance") {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${order.id}/payment/${phase}`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.code === "PREVIEW_REQUIRED" ? t("app.preview.errRequired") : data?.code === "REVISION_PENDING" ? t("app.preview.errPending") : t("app.order.errPay"));
      if (data?.code === "REVISION_PENDING") router.refresh();
      return;
    }
    const data = await res.json();
    router.push(data.redirectUrl);
  }

  return (
    <div className="mx-auto max-w-[820px] px-6 py-10 md:py-14">
      <div className="mb-8">
        <span className="mb-2 inline-flex items-center rounded-full bg-blue-soft px-3 py-1 text-[12.5px] font-semibold text-blue-2">
          {t(`app.status.${order.status}`)}
        </span>
        <h1 className="font-serif text-[26px] text-navy">{order.reference}</h1>
        <p className="mt-1 text-[14px] text-muted">
          {order.service.name} · {order.sourceLang.toUpperCase()} → {order.targetLang.toUpperCase()} ·{" "}
          {t(order.pages > 1 ? "app.order.pagesMany" : "app.order.pagesOne", { count: order.pages })}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[13.5px] text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-4 text-[16.5px] text-navy">{t("order.fulfilment")}</h2>
            <dl className="grid gap-2 text-[13.5px]"><div><dt className="font-semibold text-ink">{t("order.destinationCountry")}</dt><dd className="text-muted">{order.destinationCountry}</dd></div>{order.receivingAuthority && <div><dt className="font-semibold text-ink">{t("order.receivingAuthority")}</dt><dd className="text-muted">{order.receivingAuthority}</dd></div>}<div><dt className="font-semibold text-ink">{t("order.purpose")}</dt><dd className="whitespace-pre-wrap text-muted">{order.purpose}</dd></div><div><dt className="font-semibold text-ink">{t("order.deliveryMethod")}</dt><dd className="text-muted">{t(`order.delivery.${order.deliveryMethod.toLowerCase()}`)}</dd></div></dl>
          </section>
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-4 text-[16.5px] text-navy">{t("app.order.source")}</h2>
            {sourceDoc ? (
              <a
                href={`/api/orders/${order.id}/documents/${sourceDoc.id}/download`}
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-blue hover:text-blue-2"
              >
                {t("app.order.download", { name: sourceDoc.originalName })}
              </a>
            ) : (
              <p className="text-[13.5px] text-muted">{t("app.order.noDocument")}</p>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-4 text-[16.5px] text-navy">{t("app.order.translation")}</h2>
            {!translatedDoc ? (
              <p className="text-[13.5px] text-muted">
                {t("app.order.notYet")}
              </p>
            ) : order.balancePaid ? (
              <a
                href={`/api/orders/${order.id}/documents/${translatedDoc.id}/download`}
                className="inline-flex items-center gap-2 rounded-xl bg-ok px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:opacity-90"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
                </svg>
                {t("app.order.downloadCertified")}
              </a>
            ) : order.status === "FICHIER_EN_ATTENTE_DE_SOLDE" && !order.revisionRequested && !revisionSent ? (
              <div className="grid gap-4">
                <ProtectedPreview orderId={order.id} documentId={translatedDoc.id} onViewed={markViewed} onUnavailable={markUnavailable} />
                {!revisionOpen ? (
                  <button type="button" onClick={() => setRevisionOpen(true)} className="w-fit text-start text-[13px] font-semibold text-blue hover:text-blue-2">{t("app.revision.cta")}</button>
                ) : (
                  <form onSubmit={sendRevision} className="grid gap-3 rounded-xl border border-line bg-surface p-4">
                    <label htmlFor="revision-note" className="text-[13.5px] font-semibold text-ink">{t("app.revision.label")}</label>
                    <textarea id="revision-note" required minLength={5} maxLength={2000} rows={4} value={revisionNote} onChange={(event) => setRevisionNote(event.target.value)} className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none focus:border-blue focus:ring-3 focus:ring-blue/10" />
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" disabled={loading} className="rounded-xl bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-60">{t("app.revision.submit")}</button>
                      <button type="button" onClick={() => setRevisionOpen(false)} className="rounded-xl border border-line bg-white px-5 py-2.5 text-[13.5px] font-semibold text-navy">{t("app.revision.cancel")}</button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                <span className="w-fit rounded-full bg-caution-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[.08em] text-caution">{t("app.revision.pending")}</span>
                <p role="status" className="text-[13.5px] text-muted">{t("app.revision.sent")}</p>
              </div>
            )}
          </section>
        </div>

        <div className="grid gap-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-4 text-[16.5px] text-navy">{t("app.order.payment")}</h2>
            <dl className="grid gap-2.5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-muted">{t("app.order.total")}</dt>
                <dd className="font-semibold text-ink">{order.totalAmount} TND</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t("app.order.advance")}</dt>
                <dd className={order.advancePaid ? "text-ok font-semibold" : "font-semibold text-ink"}>
                  {order.advanceAmount} TND {order.advancePaid && `· ${t("app.order.paid")}`}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t("app.order.balance")}</dt>
                <dd className={order.balancePaid ? "text-ok font-semibold" : "font-semibold text-ink"}>
                  {order.balanceAmount} TND {order.balancePaid && `· ${t("app.order.paid")}`}
                </dd>
              </div>
            </dl>

            <div className="mt-5 grid gap-2.5">
              {order.status === "DEVIS_A_VALIDER" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={acceptQuote}
                  className="inline-flex items-center justify-center rounded-xl bg-blue px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:opacity-60"
                >
                  {t("app.order.acceptQuote")}
                </button>
              )}
              {order.status === "EN_ATTENTE_ACOMPTE" && order.advanceInPerson && (
                <p role="status" className="rounded-xl border border-caution-line bg-caution-soft px-4 py-3 text-[13px] leading-5 text-caution">{t("app.order.advanceInPerson", { amount: order.advanceAmount })}</p>
              )}
              {order.status === "EN_ATTENTE_ACOMPTE" && !order.advanceInPerson && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => pay("advance")}
                  className="inline-flex items-center justify-center rounded-xl bg-blue px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:opacity-60"
                >
                  {t("app.order.payAdvance", { amount: order.advanceAmount })}
                </button>
              )}
              {order.status === "FICHIER_EN_ATTENTE_DE_SOLDE" && !order.revisionRequested && !revisionSent && (
                <button
                  type="button"
                  disabled={loading || (!viewed && !previewUnavailable)}
                  onClick={() => pay("balance")}
                  className="inline-flex items-center justify-center rounded-xl bg-ok px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
                >
                  {t("app.order.payBalance", { amount: order.balanceAmount })}
                </button>
              )}
              {order.status === "FICHIER_EN_ATTENTE_DE_SOLDE" && !order.revisionRequested && !revisionSent && !viewed && !previewUnavailable && (
                <p className="text-[12px] text-muted">{t("app.preview.mustView")}</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-4 text-[16.5px] text-navy">{t("app.order.tracking")}</h2>
            <ol className="grid gap-3">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-[13.5px]">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                  <div>
                    <div className="font-medium text-ink">{t(`app.status.${h.status}`)}</div>
                    <div className="text-muted">{new Date(h.createdAt).toLocaleString(getDateLocale(locale))}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
