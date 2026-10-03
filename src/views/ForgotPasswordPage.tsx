"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import AuthShell from "@/views/components/AuthShell";
import { useI18n } from "@/views/components/I18nProvider";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(false);
    const result = await authClient.requestPasswordReset({ email, redirectTo: "/reinitialiser-mot-de-passe" });
    setLoading(false);
    if (result.error) setError(true);
    else setSent(true);
  }

  return (
    <AuthShell eyebrow={t("login.eyebrow")} title={t("login.sideTitle")} subtitle={t("login.sideSubtitle")}>
      <h1 className="text-[27px] text-navy">{t("app.auth.forgotTitle")}</h1>
      <p className="mt-2 text-[14px] leading-6 text-muted">{t("app.auth.forgotHint")}</p>
      {sent ? (
        <div role="status" className="mt-6 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-[13.5px] text-ink">{t("app.auth.resetSent")}</div>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-4">
          {error && <div role="alert" className="rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[13.5px] text-danger">{t("app.err.generic")}</div>}
          <div><label htmlFor="reset-email" className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("common.email")}</label><input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-blue focus:ring-3 focus:ring-blue/10" /></div>
          <button type="submit" disabled={loading} className="inline-flex justify-center rounded-xl bg-blue px-6 py-3.5 text-[14px] font-semibold text-white hover:bg-blue-2 disabled:opacity-60">{loading ? t("app.auth.sending") : t("app.auth.sendReset")}</button>
        </form>
      )}
      <Link href="/login" className="mt-6 inline-block text-[13px] font-semibold text-blue hover:text-blue-2">{t("app.auth.backLogin")}</Link>
    </AuthShell>
  );
}
