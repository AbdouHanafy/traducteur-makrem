"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TranslatedFileAccess } from "@/lib/order-file-access";
import FileAccessBadge from "@/views/components/FileAccessBadge";
import { useI18n } from "@/views/components/I18nProvider";

export interface AdminOrderDetailData {
  id: string;
  reference: string;
  status: string;
  pages: number;
  sourceLang: string;
  targetLang: string;
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
  fileAccess: TranslatedFileAccess;
  revision: { note: string; requestedAt: string } | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
  service: { name: string };
  documents: { id: string; kind: "SOURCE" | "TRANSLATED"; originalName: string }[];
}

type StepState = "done" | "current" | "pending";

interface Step {
  key: string;
  title: string;
  description: string;
  state: StepState;
  waitingOnClient?: boolean;
}

export default function AdminOrderDetailPage({ order }: { order: AdminOrderDetailData }) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewCopy, setPreviewCopy] = useState<File | null>(null);
  const [quoteForm, setQuoteForm] = useState({ pages: String(order.pages), total: "", reason: "" });
  const [quoteMessage, setQuoteMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const sourceDoc = order.documents.find((d) => d.kind === "SOURCE");
  const translatedDoc = order.documents.find((d) => d.kind === "TRANSLATED");
  const isCancelled = order.status === "ANNULEE";

  async function startTranslation() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${order.id}/status`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setError(t("adm.order.errStart"));
      return;
    }
    router.refresh();
  }

  async function adjustQuote(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setQuoteMessage(null);
    const res = await fetch(`/api/admin/orders/${order.id}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pages: Number(quoteForm.pages), total: quoteForm.total.trim() ? Number(quoteForm.total) : undefined, reason: quoteForm.reason }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      setQuoteMessage({ kind: "error", text: data?.code === "QUOTE_LOCKED" ? t("adm.quote.locked") : data?.code === "NO_CHANGE" ? t("adm.quote.noChange") : t("adm.quote.errSave") });
      return;
    }
    setQuoteMessage({ kind: "ok", text: t("adm.quote.saved", { total: data.totalAmount }) });
    setQuoteForm((current) => ({ ...current, total: "", reason: "" }));
    router.refresh();
  }

  async function uploadTranslated(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError(t("adm.order.errSelectFile"));
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    if (previewCopy) formData.set("previewCopy", previewCopy);
    const res = await fetch(`/api/admin/orders/${order.id}/document`, { method: "POST", body: formData });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || t("adm.order.errUpload"));
      return;
    }
    router.refresh();
  }

  // --- Checklist reflétant le process réel du traducteur, pas juste l'historique brut. ---
  const quoteAccepted = !["DEMANDE", "DEVIS_A_VALIDER"].includes(order.status);
  const translationStarted = ["EN_TRADUCTION", "TRADUCTION_TERMINEE", "FICHIER_EN_ATTENTE_DE_SOLDE", "SOLDE_PAYE", "TELECHARGEABLE", "TERMINEE"].includes(order.status);
  const isDone = ["TELECHARGEABLE", "TERMINEE"].includes(order.status);

  const steps: Step[] = [
    {
      key: "quote",
      title: t("adm.order.stepQuote"),
      description: t("adm.order.stepQuoteDesc"),
      state: quoteAccepted ? "done" : "current",
      waitingOnClient: !quoteAccepted,
    },
    {
      key: "advance",
      title: t("adm.order.stepAdvance"),
      description: t("adm.order.stepAdvanceDesc", { amount: order.advanceAmount }),
      state: order.advancePaid ? "done" : quoteAccepted ? "current" : "pending",
      waitingOnClient: quoteAccepted && !order.advancePaid,
    },
    {
      key: "start",
      title: t("adm.order.stepStart"),
      description: t("adm.order.stepStartDesc"),
      state: translationStarted ? "done" : order.advancePaid ? "current" : "pending",
    },
    {
      key: "deliver",
      title: t("adm.order.stepDeliver"),
      description: t("adm.order.stepDeliverDesc"),
      state: translatedDoc ? "done" : translationStarted ? "current" : "pending",
    },
    {
      key: "balance",
      title: t("adm.order.stepBalance"),
      description: t("adm.order.stepBalanceDesc", { amount: order.balanceAmount }),
      state: order.balancePaid ? "done" : translatedDoc ? "current" : "pending",
      waitingOnClient: Boolean(translatedDoc) && !order.balancePaid,
    },
    {
      key: "done",
      title: t("adm.order.stepDone"),
      description: t("adm.order.stepDoneDesc"),
      state: isDone ? "done" : "pending",
    },
  ];

  return (
    <div className="mx-auto max-w-[980px] px-6 py-14">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[12.5px] font-semibold ${
                isCancelled ? "bg-mist text-muted" : "bg-blue-soft text-blue-2"
              }`}
            >
              {t(`app.status.${order.status}`)}
            </span>
            <FileAccessBadge access={order.fileAccess} />
          </div>
          <h1 className="font-serif text-[26px] text-navy">{order.reference}</h1>
          <p className="mt-1 text-[14px] text-muted">
            {order.service.name} · {order.sourceLang.toUpperCase()} → {order.targetLang.toUpperCase()} ·{" "}
            {t(order.pages > 1 ? "adm.order.pagesMany" : "adm.order.pagesOne", { count: order.pages })}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white px-5 py-3 text-right">
          <div className="text-[12px] uppercase tracking-wide text-muted">{t("adm.order.total")}</div>
          <div className="font-serif text-[22px] text-navy">{order.totalAmount} TND</div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[13.5px] text-danger">
          {error}
        </div>
      )}

      {order.revision && (
        <section role="alert" className="mb-6 rounded-2xl border border-caution-line bg-caution-soft p-5">
          <h2 className="text-[15px] font-semibold text-caution">{t("adm.revision.title")}</h2>
          <p className="mt-1 text-[12px] text-caution">{new Date(order.revision.requestedAt).toLocaleString()}</p>
          <blockquote className="mt-3 whitespace-pre-wrap rounded-lg bg-white px-4 py-3 text-[13.5px] text-ink">{order.revision.note}</blockquote>
          <form onSubmit={uploadTranslated} className="mt-4 grid gap-2.5">
            <label htmlFor="revision-file" className="text-[13px] font-semibold text-ink">{t("adm.revision.replace")}</label>
            <input
              id="revision-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-dashed border-line bg-white px-3.5 py-2.5 text-[13.5px] text-ink outline-none"
            />
            <label htmlFor="revision-preview-copy" className="text-[13px] font-semibold text-ink">{t("adm.preview.copyLabel")}</label>
            <input id="revision-preview-copy" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setPreviewCopy(e.target.files?.[0] ?? null)} className="w-full rounded-lg border border-dashed border-line bg-white px-3.5 py-2.5 text-[13.5px] text-ink outline-none" />
            <button type="submit" disabled={loading} className="inline-flex w-fit items-center justify-center rounded-xl bg-ok px-4 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-60">{t("adm.revision.submit")}</button>
          </form>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="mb-5 text-[16.5px] text-navy">{t("adm.order.tracking")}</h2>

          <ol className="grid gap-0">
            {steps.map((step, index) => (
              <li key={step.key} className="relative flex gap-4 pb-7 last:pb-0">
                {index < steps.length - 1 && (
                  <span
                    className={`absolute left-[15px] top-8 h-full w-[2px] ${
                      step.state === "done" ? "bg-ok" : "bg-line"
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-[13px] font-semibold ${
                    step.state === "done"
                      ? "border-ok bg-ok text-white"
                      : step.state === "current"
                        ? "border-blue bg-white text-blue"
                        : "border-line bg-white text-muted"
                  }`}
                >
                  {step.state === "done" ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-[14.5px] font-semibold ${
                        step.state === "pending" ? "text-muted" : "text-ink"
                      }`}
                    >
                      {step.title}
                    </h3>
                    {step.waitingOnClient && (
                      <span className="rounded-full bg-mist px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                        {t("adm.order.waitingClient")}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[13px] text-muted">{step.description}</p>

                  {step.key === "start" && step.state === "current" && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={startTranslation}
                      className="mt-3 inline-flex items-center justify-center rounded-xl bg-blue px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:opacity-60"
                    >
                      {t("adm.order.startBtn")}
                    </button>
                  )}

                  {step.key === "deliver" && step.state === "current" && (
                    <form onSubmit={uploadTranslated} className="mt-3 grid gap-2.5">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="w-full rounded-lg border border-dashed border-line bg-mist px-3.5 py-2.5 text-[13.5px] text-ink outline-none"
                      />
                      <label htmlFor="preview-copy" className="text-[12.5px] font-semibold text-ink">{t("adm.preview.copyLabel")}</label>
                      <input id="preview-copy" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setPreviewCopy(e.target.files?.[0] ?? null)} className="w-full rounded-lg border border-dashed border-line bg-mist px-3.5 py-2.5 text-[13.5px] text-ink outline-none" />
                      <p className="-mt-1 text-[11.5px] text-muted">{t("adm.preview.copyHint")}</p>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-fit items-center justify-center rounded-xl bg-ok px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
                      >
                        {t("adm.order.uploadBtn")}
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-3 text-[16.5px] text-navy">{t("order.fulfilment")}</h2>
            <dl className="grid gap-2 text-[13.5px]"><div><dt className="font-semibold text-ink">{t("order.destinationCountry")}</dt><dd className="text-muted">{order.destinationCountry}</dd></div>{order.receivingAuthority && <div><dt className="font-semibold text-ink">{t("order.receivingAuthority")}</dt><dd className="text-muted">{order.receivingAuthority}</dd></div>}<div><dt className="font-semibold text-ink">{t("order.purpose")}</dt><dd className="whitespace-pre-wrap text-muted">{order.purpose}</dd></div><div><dt className="font-semibold text-ink">{t("order.certificationNeeds")}</dt><dd className="text-muted">{t(`order.cert.${order.certificationNeeds.toLowerCase()}`)}</dd></div><div><dt className="font-semibold text-ink">{t("order.deliveryMethod")}</dt><dd className="text-muted">{t(`order.delivery.${order.deliveryMethod.toLowerCase()}`)}</dd></div>{order.deliveryAddress && <div><dt className="font-semibold text-ink">{t("order.deliveryAddress")}</dt><dd className="whitespace-pre-wrap text-muted">{order.deliveryAddress}</dd></div>}{order.clientNotes && <div><dt className="font-semibold text-ink">{t("order.clientNotes")}</dt><dd className="whitespace-pre-wrap text-muted">{order.clientNotes}</dd></div>}</dl>
          </section>
          {order.status === "DEVIS_A_VALIDER" && (
            <section className="rounded-2xl border border-caution-line bg-caution-soft/40 p-6">
              <h2 className="mb-1 text-[16.5px] text-navy">{t("adm.quote.title")}</h2>
              <p className="mb-4 text-[12.5px] text-muted">{t("adm.quote.intro", { total: order.totalAmount })}</p>
              <form onSubmit={adjustQuote} className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="quote-pages" className="mb-1 block text-[12.5px] font-semibold text-ink">{t("adm.quote.pages")}</label>
                    <input id="quote-pages" type="number" min={1} max={500} required value={quoteForm.pages} onChange={(event) => setQuoteForm((current) => ({ ...current, pages: event.target.value }))} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-blue" />
                  </div>
                  <div>
                    <label htmlFor="quote-total" className="mb-1 block text-[12.5px] font-semibold text-ink">{t("adm.quote.total")}</label>
                    <input id="quote-total" type="number" min={0} step="0.001" value={quoteForm.total} onChange={(event) => setQuoteForm((current) => ({ ...current, total: event.target.value }))} placeholder={t("adm.quote.totalAuto")} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-blue" />
                  </div>
                </div>
                <div>
                  <label htmlFor="quote-reason" className="mb-1 block text-[12.5px] font-semibold text-ink">{t("adm.quote.reason")}</label>
                  <textarea id="quote-reason" rows={2} required minLength={3} maxLength={500} value={quoteForm.reason} onChange={(event) => setQuoteForm((current) => ({ ...current, reason: event.target.value }))} placeholder={t("adm.quote.reasonHint")} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-blue" />
                </div>
                {quoteMessage && <p role="status" className={`text-[12.5px] ${quoteMessage.kind === "ok" ? "text-ok" : "text-danger"}`}>{quoteMessage.text}</p>}
                <button type="submit" disabled={loading} className="w-fit rounded-lg bg-navy px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-navy-2 disabled:opacity-60">{t("adm.quote.submit")}</button>
              </form>
            </section>
          )}

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-3 text-[16.5px] text-navy">{t("adm.order.client")}</h2>
            <p className="text-[14px] font-medium text-ink">
              {order.user.firstName} {order.user.lastName}
            </p>
            <a href={`mailto:${order.user.email}`} className="block text-[13.5px] text-blue hover:text-blue-2">
              {order.user.email}
            </a>
            {order.user.phone && <p className="text-[13.5px] text-muted">{order.user.phone}</p>}
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-3 text-[16.5px] text-navy">{t("adm.order.documents")}</h2>
            <div className="grid gap-2.5 text-[13.5px]">
              {sourceDoc ? (
                <a
                  href={`/api/orders/${order.id}/documents/${sourceDoc.id}/download`}
                  className="flex items-center gap-2 font-semibold text-blue hover:text-blue-2"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
                  </svg>
                  {t("adm.order.source", { name: sourceDoc.originalName })}
                </a>
              ) : (
                <p className="text-muted">{t("adm.order.noSource")}</p>
              )}
              {translatedDoc ? (
                <div className="rounded-xl border border-line bg-surface p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={`/api/orders/${order.id}/documents/${translatedDoc.id}/download`}
                      className="flex min-w-0 items-center gap-2 font-semibold text-blue hover:text-blue-2"
                    >
                      <svg className="shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
                      </svg>
                      <span className="truncate">{t("adm.order.translation", { name: translatedDoc.originalName })}</span>
                    </a>
                    <FileAccessBadge access={order.fileAccess} />
                  </div>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                    {order.fileAccess === "UNLOCKED"
                      ? t("adm.order.unlockedNote")
                      : t("adm.order.lockedNote")}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 text-muted">
                  <p>{t("adm.order.notDeposited")}</p>
                  <FileAccessBadge access="NOT_READY" />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
