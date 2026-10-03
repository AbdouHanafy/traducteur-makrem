"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AuthShell from "@/views/components/AuthShell";
import { useI18n } from "@/views/components/I18nProvider";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invalid = searchParams.get("error") === "INVALID_TOKEN" || !token;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirm) return setError(t("app.auth.passwordMismatch"));
    setLoading(true);
    setError(null);
    const result = await authClient.resetPassword({ newPassword: password, token: token! });
    setLoading(false);
    if (result.error) setError(t("app.auth.invalidToken"));
    else setSuccess(true);
  }

  return (
    <AuthShell eyebrow={t("login.eyebrow")} title={t("login.sideTitle")} subtitle={t("login.sideSubtitle")}>
      <h1 className="text-[27px] text-navy">{t("app.auth.resetTitle")}</h1>
      {invalid || error ? <div role="alert" className="mt-5 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[13.5px] text-danger">{error ?? t("app.auth.invalidToken")}</div> : null}
      {success ? (
        <div role="status" className="mt-5 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-[13.5px] text-ink">{t("app.auth.resetSuccess")}</div>
      ) : !invalid ? (
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div><label htmlFor="new-password" className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("app.auth.newPassword")}</label><input id="new-password" type="password" minLength={10} maxLength={72} autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-blue focus:ring-3 focus:ring-blue/10" /></div>
          <div><label htmlFor="confirm-password" className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("app.auth.confirmPassword")}</label><input id="confirm-password" type="password" minLength={10} maxLength={72} autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-blue focus:ring-3 focus:ring-blue/10" /></div>
          <button type="submit" disabled={loading} className="inline-flex justify-center rounded-xl bg-blue px-6 py-3.5 text-[14px] font-semibold text-white hover:bg-blue-2 disabled:opacity-60">{loading ? t("app.auth.sending") : t("app.auth.resetSubmit")}</button>
        </form>
      ) : null}
      <Link href="/login" className="mt-6 inline-block text-[13px] font-semibold text-blue hover:text-blue-2">{t("app.auth.backLogin")}</Link>
    </AuthShell>
  );
}
