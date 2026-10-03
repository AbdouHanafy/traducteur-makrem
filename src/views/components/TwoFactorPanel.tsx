"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { authClient, useSession } from "@/lib/auth-client";
import { useI18n } from "@/views/components/I18nProvider";

type Stage = "idle" | "scan" | "done";

/**
 * Activation / gestion de la double authentification (TOTP + codes de secours).
 * `mandatory` : compte administrateur sous politique stricte — la désactivation est alors interdite.
 */
export default function TwoFactorPanel({ mandatory = false, onEnabled }: { mandatory?: boolean; onEnabled?: () => void }) {
  const { t } = useI18n();
  const { data: session, refetch } = useSession();
  const enabled = (session?.user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled === true;

  const [stage, setStage] = useState<Stage>("idle");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (stage !== "scan" || !secret) return;
    // Le QR est généré dans le navigateur : l'URI contenant le secret ne transite par aucun service tiers.
    QRCode.toDataURL(`otpauth://totp/${encodeURIComponent("Maître Makram Arfaoui")}:${encodeURIComponent(session?.user.email ?? "")}?secret=${secret}&issuer=${encodeURIComponent("Maître Makram Arfaoui")}`, { margin: 1, width: 192 }).then(setQr).catch(() => setQr(""));
  }, [stage, secret, session?.user.email]);

  const fail = (text: string) => setMessage({ kind: "error", text });

  async function start(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const { data, error } = await authClient.twoFactor.enable({ password });
    setBusy(false);
    if (error || !data || !("totpURI" in data)) return fail(error?.status === 429 ? t("app.err.RATE_LIMITED") : t("app.mfa.errGeneric"));
    const uriSecret = new URL(data.totpURI).searchParams.get("secret") ?? "";
    setSecret(uriSecret);
    setBackupCodes(data.backupCodes);
    setPassword("");
    setStage("scan");
  }

  async function confirm(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, "") });
    setBusy(false);
    if (error) return fail(error.status === 429 || error.code === "TOO_MANY_ATTEMPTS" ? t("app.mfa.locked") : t("app.mfa.invalidCode"));
    setCode("");
    setStage("done");
    setMessage({ kind: "ok", text: t("app.mfa.enabledDone") });
    await refetch();
    onEnabled?.();
  }

  async function regenerate(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const { data, error } = await authClient.twoFactor.generateBackupCodes({ password });
    setBusy(false);
    if (error || !data) return fail(t("app.mfa.errGeneric"));
    setPassword("");
    setBackupCodes(data.backupCodes);
    setStage("done");
    setMessage({ kind: "ok", text: t("app.mfa.regenerated") });
  }

  async function disable(event: React.FormEvent) {
    event.preventDefault();
    if (!window.confirm(t("app.mfa.disableConfirm"))) return;
    setBusy(true);
    setMessage(null);
    const { error } = await authClient.twoFactor.disable({ password });
    setBusy(false);
    if (error) return fail(t("app.mfa.errGeneric"));
    setPassword("");
    setBackupCodes([]);
    setStage("idle");
    setMessage({ kind: "ok", text: t("app.mfa.disabledDone") });
    await refetch();
  }

  function download() {
    const blob = new Blob([`${t("app.mfa.backupTitle")} — Maître Makram Arfaoui\n\n${backupCodes.join("\n")}\n`], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "codes-de-secours.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const inputClass = "w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-blue focus:ring-3 focus:ring-blue/10";

  return (
    <section className="rounded-2xl border border-edge bg-white p-6 shadow-[0_8px_25px_rgba(20,40,77,0.04)]" aria-labelledby="mfa-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="mfa-title" className="text-[15px] font-semibold text-navy">{t("app.mfa.title")}</h2>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${enabled ? "bg-ok-soft text-ok" : "bg-caution-soft text-caution"}`}>{enabled ? t("app.mfa.statusOn") : t("app.mfa.statusOff")}</span>
      </div>
      <p className="mt-1.5 text-[13px] text-muted">{t("app.mfa.intro")}</p>
      {mandatory && !enabled && <p className="mt-3 rounded-lg border border-caution-line bg-caution-soft px-3 py-2 text-[12.5px] text-caution">{t("app.mfa.requiredAdmin")}</p>}
      {message && <p role={message.kind === "error" ? "alert" : "status"} className={`mt-3 rounded-lg px-3 py-2 text-[13px] ${message.kind === "ok" ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger"}`}>{message.text}</p>}

      {!enabled && stage === "idle" && (
        <form onSubmit={start} className="mt-4 grid gap-3">
          <div>
            <label htmlFor="mfa-password" className="mb-1.5 block text-[13px] font-semibold text-ink">{t("app.mfa.password")}</label>
            <input id="mfa-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={busy} className="w-fit rounded-xl bg-blue px-5 py-3 text-[13.5px] font-semibold text-white transition hover:bg-blue-2 disabled:opacity-60">{t("app.mfa.start")}</button>
        </form>
      )}

      {!enabled && stage === "scan" && (
        <div className="mt-5 grid gap-5">
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {qr ? <img src={qr} alt={t("app.mfa.qrAlt")} width={192} height={192} className="rounded-xl border border-edge" /> : <div className="h-48 w-48 animate-pulse rounded-xl bg-mist" />}
            <div>
              <p className="text-[13.5px] font-semibold text-ink">{t("app.mfa.scan")}</p>
              <p className="mt-1 break-all text-[12px] text-muted">{t("app.mfa.manualKey")} <code className="font-mono text-ink">{secret}</code></p>
            </div>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-[13px] font-semibold text-navy">{t("app.mfa.backupTitle")}</p>
            <p className="mt-1 text-[12px] text-muted">{t("app.mfa.backupHint")}</p>
            <ul className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[12.5px] text-ink sm:grid-cols-3">{backupCodes.map((item) => <li key={item}>{item}</li>)}</ul>
            <button type="button" onClick={download} className="mt-3 text-[12.5px] font-semibold text-blue hover:text-blue-2">{t("app.mfa.backupDownload")}</button>
          </div>
          <form onSubmit={confirm} className="grid gap-3">
            <label htmlFor="mfa-confirm" className="text-[13.5px] font-semibold text-ink">{t("app.mfa.enterCode")}</label>
            <input id="mfa-confirm" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={7} required value={code} onChange={(event) => setCode(event.target.value)} className={`${inputClass} max-w-[220px] tracking-[0.3em]`} />
            <button type="submit" disabled={busy || code.replace(/\s/g, "").length < 6} className="w-fit rounded-xl bg-blue px-5 py-3 text-[13.5px] font-semibold text-white transition hover:bg-blue-2 disabled:opacity-60">{t("app.mfa.confirm")}</button>
          </form>
        </div>
      )}

      {stage === "done" && backupCodes.length > 0 && (
        <div className="mt-4 rounded-xl bg-surface p-4">
          <p className="text-[13px] font-semibold text-navy">{t("app.mfa.backupTitle")}</p>
          <p className="mt-1 text-[12px] text-muted">{t("app.mfa.backupHint")}</p>
          <ul className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[12.5px] text-ink sm:grid-cols-3">{backupCodes.map((item) => <li key={item}>{item}</li>)}</ul>
          <button type="button" onClick={download} className="mt-3 text-[12.5px] font-semibold text-blue hover:text-blue-2">{t("app.mfa.backupDownload")}</button>
        </div>
      )}

      {enabled && (
        <div className="mt-4 grid gap-4">
          <form onSubmit={regenerate} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="mfa-manage-password" className="mb-1.5 block text-[13px] font-semibold text-ink">{t("app.mfa.password")}</label>
              <input id="mfa-manage-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={busy || !password} className="rounded-xl border border-line bg-white px-4 py-3 text-[13px] font-semibold text-navy transition hover:border-blue disabled:opacity-50">{t("app.mfa.regenerate")}</button>
              {!mandatory && <button type="button" onClick={disable} disabled={busy || !password} className="rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[13px] font-semibold text-danger transition disabled:opacity-50">{t("app.mfa.disable")}</button>}
            </div>
          </form>
          {mandatory && <p className="text-[12px] text-muted">{t("app.mfa.cannotDisable")}</p>}
        </div>
      )}
    </section>
  );
}
