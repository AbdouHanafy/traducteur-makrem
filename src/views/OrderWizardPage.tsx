"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import FileDropzone from "@/views/components/FileDropzone";
import { DELAY_OPTIONS } from "@/lib/delay-options";
import { signUp, useSession } from "@/lib/auth-client";
import { useI18n } from "@/views/components/I18nProvider";
import ConsentFields from "@/views/components/ConsentFields";

interface ServiceOption {
  id: string;
  slug: string;
  name: string;
  pricePerPage: string;
}

const LANGUAGES = [
  { value: "fr", label: "order.langFrench" },
  { value: "ar", label: "order.langArabic" },
  { value: "en", label: "order.langEnglish" },
];

const MAX_FILE_BYTES = 20 * 1024 * 1024;

const fieldClass = "w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-blue focus:ring-3 focus:ring-blue/10";

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed, lastName: trimmed };
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) };
}

export default function OrderWizardPage({ services, delayMultipliers }: { services: ServiceOption[]; delayMultipliers: Record<string, string> }) {
  const { t } = useI18n();
  const router = useRouter();
  const requestedSlug = useSearchParams().get("service");
  const initialServiceId = services.find((service) => service.slug === requestedSlug)?.id;
  const { data: session, isPending: sessionPending } = useSession();
  const [serviceId, setServiceId] = useState(initialServiceId ?? services[0]?.id ?? "");
  const [sourceLang, setSourceLang] = useState("ar");
  const [targetLang, setTargetLang] = useState("fr");
  const [pages, setPages] = useState(1);
  const availableDelays = DELAY_OPTIONS.filter((delay) => delay.key in delayMultipliers);
  const [delayKey, setDelayKey] = useState<string>(availableDelays[0]?.key ?? DELAY_OPTIONS[0].key);
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState({ destinationCountry: "", receivingAuthority: "", purpose: "", certificationNeeds: "UNSURE", deliveryMethod: "DIGITAL", deliveryAddress: "", clientNotes: "" });
  const [account, setAccount] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [accepted, setAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedService = services.find((service) => service.id === serviceId);
  const selectedDelay = availableDelays.find((delay) => delay.key === delayKey);
  const estimatedTotal = selectedService ? Number(selectedService.pricePerPage) * pages * Number(delayMultipliers[delayKey] ?? 1) : 0;
  const needsAccount = !sessionPending && !session;

  function updateAccount(field: keyof typeof account) {
    return (event: React.ChangeEvent<HTMLInputElement>) => setAccount((current) => ({ ...current, [field]: event.target.value }));
  }

  function updateDetails(field: keyof typeof details) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDetails((current) => ({ ...current, [field]: event.target.value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (sourceLang === targetLang) {
      setError(t("order.sameLanguage"));
      return;
    }
    if (!file) {
      setError(t("order.fileRequired"));
      return;
    }

    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      setError(t(file.size === 0 ? "app.err.FILE_EMPTY" : "app.err.FILE_TOO_LARGE"));
      return;
    }

    setLoading(true);
    if (needsAccount) {
      const { firstName, lastName } = splitFullName(account.fullName);
      const { error: signUpError } = await signUp.email({ name: account.fullName.trim(), email: account.email, password: account.password, firstName, lastName, phone: account.phone || undefined, termsAccepted: accepted, website: honeypot } as Parameters<typeof signUp.email>[0]);
      if (signUpError) {
        setLoading(false);
        setError(signUpError.code === "USER_ALREADY_EXISTS" || signUpError.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ? t("app.err.emailExistsLogin") : signUpError.code === "CONSENT_REQUIRED" ? t("app.err.CONSENT_REQUIRED") : signUpError.status === 429 ? t("app.err.RATE_LIMITED") : t("app.err.accountCreate"));
        return;
      }
    }

    const formData = new FormData();
    formData.set("serviceId", serviceId);
    formData.set("sourceLang", sourceLang);
    formData.set("targetLang", targetLang);
    formData.set("pages", String(pages));
    formData.set("delayKey", delayKey);
    for (const [key, value] of Object.entries(details)) formData.set(key, value);
    formData.set("file", file);
    const response = await fetch("/api/orders", { method: "POST", body: formData });
    setLoading(false);
    if (response.status === 401) {
      router.push("/login?callbackUrl=/commander");
      return;
    }
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(response.status === 429 ? t("app.err.RATE_LIMITED") : data?.code ? t(`app.err.${data.code}`) : t("app.err.generic"));
      return;
    }
    const data = await response.json();
    router.push(`/dashboard/orders/${data.id}`);
    router.refresh();
  }

  return (
    <>
      <Topbar />
      <main id="main-content" tabIndex={-1} className="flex-1 bg-surface">
        <section className="relative overflow-hidden bg-[linear-gradient(145deg,var(--color-navy-2)_0%,var(--color-navy)_70%,color-mix(in_srgb,var(--color-navy)_63%,var(--color-blue))_100%)] py-[calc(3rem*var(--section-scale))] text-white sm:py-[calc(3.5rem*var(--section-scale))]">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border-[55px] border-white/[0.035]" />
          <div className="relative mx-auto max-w-(--site-width) px-4 sm:px-6 lg:px-8">
            <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[.18em] text-accent-light">{t("order.eyebrow")}</p>
            <h1 className="max-w-[24ch] text-[clamp(28px,4vw,42px)] text-white">{t("order.title")}</h1>
            <p className="mt-3 max-w-[62ch] text-[14px] leading-6 text-slate-300">{t("order.subtitle")}</p>
            <ul className="mt-7 flex max-w-[760px] flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-slate-200">
              {[t("order.fulfilment"), t("order.stepNeed"), t("order.sourceDocument"), t("order.stepContact")].map((label) => <li key={label} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full border border-white/30 bg-white/10 text-[10px]" aria-hidden="true">✓</span>{label}</li>)}
            </ul>
          </div>
        </section>

        <section className="py-8 sm:py-[calc(3rem*var(--section-scale))]">
          <div className="mx-auto max-w-(--site-width) px-4 sm:px-6 lg:px-8">
            {services.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-10 text-center text-muted">{t("order.noServices")} <Link href="/contact" className="font-semibold text-blue">{t("order.contactUs")}</Link>.</div>
            ) : (
              <form onSubmit={onSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
                <div className="grid gap-5">
                  {error && <div role="alert" className="rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[13px] text-danger">{error}</div>}

                  <section className="rounded-2xl border border-edge bg-white p-5 shadow-[0_8px_28px_rgba(20,40,77,0.045)] sm:p-7">
                    <div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-soft text-[12px] font-bold text-blue">01</span><div><h2 className="text-[17px] text-navy">{t("order.fulfilment")}</h2><p className="text-[11.5px] text-muted">{t("order.fulfilmentHint")}</p></div></div>
                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><label htmlFor="destinationCountry" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.destinationCountry")}</label><input id="destinationCountry" required maxLength={100} value={details.destinationCountry} onChange={updateDetails("destinationCountry")} className={fieldClass} /></div>
                        <div><label htmlFor="receivingAuthority" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.receivingAuthority")}</label><input id="receivingAuthority" maxLength={160} value={details.receivingAuthority} onChange={updateDetails("receivingAuthority")} className={fieldClass} /></div>
                      </div>
                      <div><label htmlFor="purpose" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.purpose")}</label><textarea id="purpose" required rows={3} maxLength={1000} value={details.purpose} onChange={updateDetails("purpose")} className={fieldClass} /></div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><label htmlFor="certificationNeeds" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.certificationNeeds")}</label><select id="certificationNeeds" value={details.certificationNeeds} onChange={updateDetails("certificationNeeds")} className={fieldClass}><option value="UNSURE">{t("order.cert.unsure")}</option><option value="NONE">{t("order.cert.none")}</option><option value="CERTIFIED">{t("order.cert.certified")}</option><option value="LEGALIZATION">{t("order.cert.legalization")}</option><option value="APOSTILLE">{t("order.cert.apostille")}</option></select></div>
                        <div><label htmlFor="deliveryMethod" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.deliveryMethod")}</label><select id="deliveryMethod" value={details.deliveryMethod} onChange={updateDetails("deliveryMethod")} className={fieldClass}><option value="DIGITAL">{t("order.delivery.digital")}</option><option value="PICKUP">{t("order.delivery.pickup")}</option><option value="COURIER">{t("order.delivery.courier")}</option></select></div>
                      </div>
                      {details.deliveryMethod === "COURIER" && <div><label htmlFor="deliveryAddress" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.deliveryAddress")}</label><textarea id="deliveryAddress" required rows={3} maxLength={1000} value={details.deliveryAddress} onChange={updateDetails("deliveryAddress")} className={fieldClass} /></div>}
                      <div><label htmlFor="clientNotes" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.clientNotes")}</label><textarea id="clientNotes" rows={3} maxLength={3000} value={details.clientNotes} onChange={updateDetails("clientNotes")} className={fieldClass} /></div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-edge bg-white p-5 shadow-[0_8px_28px_rgba(20,40,77,0.045)] sm:p-7">
                    <div className="mb-6 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-soft text-[12px] font-bold text-blue">02</span><div><h2 className="text-[17px] text-navy">{t("order.stepNeed")}</h2><p className="text-[11.5px] text-muted">{t("order.needHint")}</p></div></div>
                    <div className="grid gap-5">
                      <div><label htmlFor="service" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.service")}</label><select id="service" value={serviceId} onChange={(event) => setServiceId(event.target.value)} className={fieldClass}>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></div>
                      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                        <div><label htmlFor="sourceLang" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.sourceLanguage")}</label><select id="sourceLang" value={sourceLang} onChange={(event) => setSourceLang(event.target.value)} className={fieldClass}>{LANGUAGES.map((language) => <option key={language.value} value={language.value}>{t(language.label)}</option>)}</select></div>
                        <span className="mb-3 hidden text-slate-400 sm:block" aria-hidden="true">→</span>
                        <div><label htmlFor="targetLang" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.targetLanguage")}</label><select id="targetLang" value={targetLang} onChange={(event) => setTargetLang(event.target.value)} className={fieldClass}>{LANGUAGES.map((language) => <option key={language.value} value={language.value}>{t(language.label)}</option>)}</select></div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="pages" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.pages")}</label><input id="pages" type="number" min={1} max={500} value={pages} onChange={(event) => setPages(Math.max(1, Number(event.target.value)))} className={fieldClass} /></div><div><label htmlFor="delay" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.deadline")}</label><select id="delay" value={delayKey} onChange={(event) => setDelayKey(event.target.value)} className={fieldClass}>{availableDelays.map((delay) => <option key={delay.key} value={delay.key}>{t(delay.key)}</option>)}</select></div></div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-edge bg-white p-5 shadow-[0_8px_28px_rgba(20,40,77,0.045)] sm:p-7">
                    <div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-soft text-[12px] font-bold text-blue">03</span><div><h2 className="text-[17px] text-navy">{t("order.sourceDocument")}</h2><p className="text-[11.5px] text-muted">{t("order.privateFile")}</p></div></div>
                    <FileDropzone file={file} onChange={setFile} accept=".pdf,.jpg,.jpeg,.png" hint={t("order.fileHint")} />
                  </section>

                  {needsAccount && <section className="rounded-2xl border border-edge bg-white p-5 shadow-[0_8px_28px_rgba(20,40,77,0.045)] sm:p-7">
                    <div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-soft text-[12px] font-bold text-blue">04</span><div><h2 className="text-[17px] text-navy">{t("order.stepContact")}</h2><p className="text-[11.5px] text-muted">{t("order.contactHint")}</p></div></div>
                    <div className="grid gap-4"><div><label htmlFor="fullName" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.fullName")}</label><input id="fullName" required value={account.fullName} onChange={updateAccount("fullName")} autoComplete="name" placeholder="Sarra Ben Ali" className={fieldClass} /></div><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="orderEmail" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("common.email")}</label><input id="orderEmail" required type="email" value={account.email} onChange={updateAccount("email")} autoComplete="email" placeholder="you@example.com" className={fieldClass} /></div><div><label htmlFor="orderPhone" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("common.phone")}</label><input id="orderPhone" required type="tel" value={account.phone} onChange={updateAccount("phone")} autoComplete="tel" placeholder="(+216) 22 200 170" className={fieldClass} /></div></div><div><label htmlFor="orderPassword" className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("order.accountPassword")}</label><input id="orderPassword" required type="password" minLength={10} value={account.password} onChange={updateAccount("password")} autoComplete="new-password" placeholder={t("register.passwordHint")} className={fieldClass} /></div><p className="text-[11.5px] text-muted">{t("order.existing")} <Link href="/login?callbackUrl=/commander" className="font-semibold text-blue">{t("register.login")}</Link> {t("order.loginHint")}</p></div><ConsentFields accepted={accepted} onAcceptedChange={setAccepted} honeypot={honeypot} onHoneypotChange={setHoneypot} />
                  </section>}
                </div>

                <aside className="rounded-2xl border border-edge bg-white p-5 shadow-[0_12px_38px_rgba(20,40,77,0.08)] lg:sticky lg:top-[96px] sm:p-6">
                  <h2 className="text-[17px] text-navy">{t("order.summary")}</h2>
                  <dl className="mt-5 grid gap-3 text-[12.5px]"><div className="flex justify-between gap-4"><dt className="text-muted">{t("nav.services")}</dt><dd className="text-right font-semibold text-ink">{selectedService?.name}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">{t("order.translation")}</dt><dd className="font-semibold text-ink">{t(LANGUAGES.find((item) => item.value === sourceLang)?.label ?? "order.langArabic")} → {t(LANGUAGES.find((item) => item.value === targetLang)?.label ?? "order.langFrench")}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">{t("order.volume")}</dt><dd className="font-semibold text-ink">{pages}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">{t("order.deadline")}</dt><dd className="text-right font-semibold text-ink">{selectedDelay ? t(selectedDelay.key) : ""}</dd></div></dl>
                  <div className="my-5 border-t border-line" />
                  <div className="flex items-end justify-between gap-3"><span className="text-[12.5px] text-muted">{t("order.initialEstimate")}</span><span className="text-[23px] font-semibold text-navy">{estimatedTotal.toFixed(3)} <small className="text-[11px] font-semibold">TND</small></span></div>
                  <p className="mt-2 rounded-lg bg-surface px-3 py-2.5 text-[10.5px] leading-4 text-muted">{t("order.estimateNote")}</p>
                  <button type="submit" disabled={loading || sessionPending} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue px-5 py-3.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(36,86,184,0.22)] transition hover:bg-blue-2 disabled:cursor-not-allowed disabled:opacity-60">{loading ? needsAccount ? t("order.creating") : t("order.sending") : t("order.receiveQuote")}<span aria-hidden="true">→</span></button>
                  <div className="mt-5 grid gap-2.5 border-t border-line pt-5 text-[10.5px] text-muted"><div className="flex items-center gap-2"><span className="text-ok">✓</span>{t("order.noPayment")}</div><div className="flex items-center gap-2"><span className="text-ok">✓</span>{t("order.confidential")}</div><div className="flex items-center gap-2"><span className="text-ok">✓</span>{t("order.fullTracking")}</div></div>
                </aside>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
