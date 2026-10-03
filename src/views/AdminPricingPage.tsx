"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/views/components/I18nProvider";

interface RuleRow {
  key: string;
  multiplier: string;
  active: boolean;
}

const EXAMPLE_PAGES = 3;

export default function AdminPricingPage({ rules, example }: { rules: RuleRow[]; example: { name: string; pricePerPage: string } | null }) {
  const { t } = useI18n();
  const router = useRouter();
  const [rows, setRows] = useState(rules);
  const [saved, setSaved] = useState<Record<string, RuleRow>>(() => Object.fromEntries(rules.map((rule) => [rule.key, rule])));
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const activeCount = rows.filter((row) => row.active).length;

  async function save(row: RuleRow) {
    setBusy(row.key);
    setMessage(null);
    const response = await fetch(`/api/admin/pricing-rules/${encodeURIComponent(row.key)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ multiplier: Number(row.multiplier), active: row.active }),
    });
    const data = await response.json().catch(() => null);
    setBusy(null);
    if (!response.ok) {
      setMessage({ kind: "error", text: data?.code === "LAST_ACTIVE_RULE" ? t("adm.pricing.lastActive") : t("adm.pricing.errSave") });
      return;
    }
    setSaved((current) => ({ ...current, [row.key]: { key: row.key, multiplier: data.rule.multiplier, active: data.rule.active } }));
    setMessage({ kind: "ok", text: t("adm.pricing.saved", { name: t(row.key) }) });
    router.refresh();
  }

  const total = (multiplier: string) => {
    if (!example) return null;
    const value = Number(example.pricePerPage) * EXAMPLE_PAGES * Number(multiplier);
    return Number.isFinite(value) ? value.toFixed(3) : null;
  };

  return (
    <div className="mx-auto max-w-[920px] px-4 py-8 sm:px-6 sm:py-12">
      <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">{t("adm.pricing.eyebrow")}</p>
      <h1 className="text-[25px] text-navy sm:text-[30px]">{t("adm.pricing.title")}</h1>
      <p className="mt-2 max-w-2xl text-[13.5px] text-muted">{t("adm.pricing.intro")}</p>

      {message && <div role="status" className={`mt-5 rounded-xl border px-4 py-3 text-[13px] ${message.kind === "ok" ? "border-ok/30 bg-ok-soft text-ok" : "border-danger-line bg-danger-soft text-danger"}`}>{message.text}</div>}

      <div className="mt-6 grid gap-4">
        {rows.map((row) => {
          const original = saved[row.key];
          const dirty = original.multiplier !== row.multiplier || original.active !== row.active;
          const valid = Number(row.multiplier) >= 0.5 && Number(row.multiplier) <= 5;
          const preview = total(row.multiplier);
          return (
            <div key={row.key} className={`rounded-2xl border bg-white p-5 shadow-[0_8px_25px_rgba(20,40,77,.04)] ${row.active ? "border-edge" : "border-dashed border-line opacity-80"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[17px] text-navy">{t(row.key)}</h2>
                  <p className="font-mono text-[10.5px] text-muted">{row.key}</p>
                </div>
                <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <input type="checkbox" checked={row.active} onChange={(event) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, active: event.target.checked } : item))} className="h-4 w-4" />
                  {t("adm.pricing.offered")}
                </label>
              </div>

              <div className="mt-4 grid items-end gap-4 sm:grid-cols-[minmax(0,200px)_1fr_auto]">
                <div>
                  <label htmlFor={`mult-${row.key}`} className="mb-1.5 block text-[12.5px] font-semibold text-ink">{t("adm.pricing.multiplier")}</label>
                  <input id={`mult-${row.key}`} type="number" inputMode="decimal" min={0.5} max={5} step={0.05} value={row.multiplier} onChange={(event) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, multiplier: event.target.value } : item))} className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-blue ${valid ? "border-line" : "border-danger"}`} />
                  <p className="mt-1 text-[11px] text-muted">{t("adm.pricing.range")}</p>
                </div>
                <div className="rounded-xl bg-surface px-4 py-3 text-[12.5px] text-muted">
                  {preview && example ? (
                    <>
                      <span className="block text-[11px] font-semibold uppercase tracking-wide">{t("adm.pricing.example")}</span>
                      <span className="text-ink">{t("adm.pricing.exampleLine", { service: example.name, pages: EXAMPLE_PAGES, total: preview })}</span>
                    </>
                  ) : t("adm.pricing.noExample")}
                </div>
                <button type="button" disabled={!dirty || !valid || busy === row.key || (!row.active && activeCount === 0)} onClick={() => save(row)} className="rounded-xl bg-blue px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-blue-2 disabled:cursor-not-allowed disabled:opacity-50">
                  {busy === row.key ? t("adm.saving") : t("adm.save")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-[12px] text-muted">{t("adm.pricing.existingOrders")}</p>
    </div>
  );
}
