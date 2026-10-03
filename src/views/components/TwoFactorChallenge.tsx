"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/views/components/I18nProvider";

/** Seconde étape de connexion : code de l'application d'authentification ou code de secours. */
export default function TwoFactorChallenge({ destination }: { destination: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [useBackup, setUseBackup] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const value = code.replace(/\s/g, "");
    const { error: verifyError } = useBackup
      ? await authClient.twoFactor.verifyBackupCode({ code: value })
      : await authClient.twoFactor.verifyTotp({ code: value });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.status === 429 || verifyError.code === "TOO_MANY_ATTEMPTS" ? t("app.mfa.locked") : t("app.mfa.invalidCode"));
      return;
    }
    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-7 grid gap-4.5">
      <h2 className="text-[19px] text-navy">{t("app.mfa.loginTitle")}</h2>
      <p className="-mt-2 text-[13.5px] text-muted">{t(useBackup ? "app.mfa.loginBackupHint" : "app.mfa.loginHint")}</p>
      {error && <div role="alert" className="rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[13.5px] text-danger">{error}</div>}
      <div>
        <label htmlFor="mfa-code" className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t(useBackup ? "app.mfa.backupCode" : "app.mfa.code")}</label>
        <input
          id="mfa-code"
          autoFocus
          required
          autoComplete="one-time-code"
          inputMode={useBackup ? "text" : "numeric"}
          maxLength={useBackup ? 24 : 7}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[16px] tracking-[0.25em] text-ink outline-none transition focus:border-blue focus:ring-3 focus:ring-blue/10"
        />
      </div>
      <button type="submit" disabled={loading || code.trim().length < 6} className="inline-flex items-center justify-center rounded-xl bg-blue px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-blue-2 disabled:cursor-not-allowed disabled:opacity-60">{t("app.mfa.verify")}</button>
      <button type="button" onClick={() => { setUseBackup((current) => !current); setCode(""); setError(null); }} className="text-start text-[13px] font-semibold text-blue hover:text-blue-2">{t(useBackup ? "app.mfa.useApp" : "app.mfa.useBackup")}</button>
    </form>
  );
}
