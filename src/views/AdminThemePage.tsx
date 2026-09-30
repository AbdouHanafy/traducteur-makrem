"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/views/components/I18nProvider";

interface TokenState {
  key: string;
  label: string;
  hint: string;
  default: string;
  value: string;
}

const HEX = /^#[0-9a-f]{6}$/i;

export default function AdminThemePage({ tokens }: { tokens: TokenState[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const tokenLabel = (key: string) => t(`adm.theme.token.${key}`);
  const tokenHint = (key: string) => t(`adm.theme.token.${key}Hint`);
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(tokens.map((token) => [token.key, token.value])));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  const invalid = tokens.some((token) => !HEX.test(values[token.key]));
  const changed = tokens.filter((token) => values[token.key].toLowerCase() !== token.default.toLowerCase()).length;

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    });
    setSaving(false);
    setFailed(!response.ok);
    setMessage(t(response.ok ? "adm.theme.saved" : "adm.theme.errSave"));
    if (response.ok) router.refresh();
  }

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">{t("adm.theme.eyebrow")}</p>
          <h1 className="text-[25px] text-navy sm:text-[30px]">{t("adm.theme.title")}</h1>
          <p className="mt-2 max-w-2xl text-[13.5px] text-muted">{t(changed > 1 ? "adm.theme.introMany" : "adm.theme.introOne", { count: changed })}</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setValues(Object.fromEntries(tokens.map((token) => [token.key, token.default])))} className="rounded-xl border border-line bg-white px-5 py-3 text-[13px] font-semibold text-muted transition hover:text-navy">{t("adm.theme.reset")}</button>
          <button type="button" onClick={save} disabled={saving || invalid} className="rounded-xl bg-blue px-6 py-3 text-[13.5px] font-semibold text-white transition hover:bg-blue-2 disabled:opacity-60">{saving ? t("adm.saving") : t("adm.content.publish")}</button>
        </div>
      </div>

      {message && <div role="status" className={`mb-5 rounded-xl border px-4 py-3 text-[13px] ${failed ? "border-[#f3c6c6] bg-[#fdecec] text-[#9c2c2c]" : "border-[#bfe3c8] bg-[#eaf7ee] text-[#2c6e3f]"}`}>{message}</div>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-[0_8px_28px_rgba(20,40,77,.04)]">
          {tokens.map((token) => {
            const value = values[token.key];
            const valid = HEX.test(value);
            return (
              <div key={token.key} className="flex flex-wrap items-center gap-4 bg-white p-4 sm:px-6">
                <input type="color" aria-label={tokenLabel(token.key)} value={valid ? value : token.default} onChange={(event) => setValues((current) => ({ ...current, [token.key]: event.target.value }))} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-white p-1" />
                <div className="min-w-[180px] flex-1"><div className="text-[13.5px] font-semibold text-navy">{tokenLabel(token.key)}</div><div className="text-[11.5px] text-muted">{tokenHint(token.key)}</div></div>
                <input value={value} onChange={(event) => setValues((current) => ({ ...current, [token.key]: event.target.value }))} spellCheck={false} maxLength={7} aria-label={`${tokenLabel(token.key)} (hex)`} className={`w-28 rounded-lg border px-3 py-2 font-mono text-[12.5px] outline-none focus:border-blue ${valid ? "border-line" : "border-red-400"}`} />
                <button type="button" onClick={() => setValues((current) => ({ ...current, [token.key]: token.default }))} disabled={value.toLowerCase() === token.default.toLowerCase()} className="text-[12px] font-semibold text-muted hover:text-blue disabled:opacity-30">{t("adm.theme.default")}</button>
              </div>
            );
          })}
        </section>

        <aside className="h-fit rounded-2xl border border-line p-5 shadow-[0_8px_28px_rgba(20,40,77,.04)] lg:sticky lg:top-[92px]" style={{ background: values.mist }}>
          <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: values.muted }}>{t("adm.theme.preview")}</p>
          <div className="rounded-xl p-5" style={{ background: values.navy }}>
            <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: values["blue-soft"] }}>{t("adm.theme.previewBrand")}</div>
            <div className="mt-1 font-serif text-[20px] text-white">{t("adm.theme.previewTitle")}</div>
          </div>
          <div className="mt-3 rounded-xl border p-4" style={{ background: values.paper, borderColor: values.line }}>
            <div className="font-serif text-[17px]" style={{ color: values.navy }}>{t("adm.theme.previewCard")}</div>
            <p className="mt-1 text-[12.5px]" style={{ color: values.muted }}>{t("adm.theme.previewMuted")}</p>
            <p className="mt-1 text-[12.5px]" style={{ color: values.ink }}>{t("adm.theme.previewInk")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg px-3 py-2 text-[12px] font-semibold text-white" style={{ background: values.blue }}>{t("adm.theme.previewButton")}</span>
              <span className="rounded-lg px-3 py-2 text-[12px] font-semibold" style={{ background: values["blue-soft"], color: values["blue-2"] }}>{t("adm.theme.previewAccent")}</span>
              <span className="rounded-lg px-3 py-2 text-[12px] font-semibold text-white" style={{ background: values.ok }}>{t("adm.theme.previewOk")}</span>
              <span className="rounded-lg px-3 py-2 text-[12px] font-semibold text-white" style={{ background: values.warn }}>{t("adm.theme.previewWarn")}</span>
              <span className="rounded-lg px-3 py-2 text-[12px] font-semibold text-white" style={{ background: values.seal }}>{t("adm.theme.previewSeal")}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
