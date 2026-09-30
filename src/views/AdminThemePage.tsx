"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/views/components/I18nProvider";
import {
  CONTRAST_PAIRS,
  CONTRAST_POLICIES,
  CUSTOM_FONT_SLOTS,
  FONT_SLOTS,
  POLICY_THRESHOLD,
  THEME_GROUPS,
  contrastRatio,
  fontOptionsFor,
  type ContrastPolicy,
  type CustomFont,
  type FontSlotKey,
  type LayoutSettings,
  type ThemeGroup,
  type ThemePreset,
} from "@/lib/theme";

interface TokenState {
  key: string;
  group: ThemeGroup;
  default: string;
  value: string;
}

const HEX = /^#[0-9a-f]{6}$/i;
const DEFAULT_FONTS: Record<FontSlotKey, string> = { heading: "spectral", body: "inter", headingAr: "system", bodyAr: "system" };
const DEFAULT_LAYOUT: LayoutSettings = { radius: 1, width: 1200, section: 1 };

export default function AdminThemePage({ tokens, presets, initialFonts, initialLayout, initialPolicy, initialCustomFonts, layoutLimits }: {
  tokens: TokenState[];
  presets: ThemePreset[];
  initialFonts: Record<FontSlotKey, string>;
  initialLayout: LayoutSettings;
  initialPolicy: ContrastPolicy;
  initialCustomFonts: CustomFont[];
  layoutLimits: Record<keyof LayoutSettings, { min: number; max: number; step: number }>;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const tokenLabel = (key: string) => t(`adm.theme.token.${key}`);
  const tokenHint = (key: string) => t(`adm.theme.token.${key}Hint`);
  const defaults = useMemo(() => Object.fromEntries(tokens.map((item) => [item.key, item.default])), [tokens]);
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(tokens.map((item) => [item.key, item.value])));
  const [fontChoice, setFontChoice] = useState(initialFonts);
  const [layout, setLayout] = useState(initialLayout);
  const [policy, setPolicy] = useState(initialPolicy);
  const [customFonts, setCustomFonts] = useState(initialCustomFonts);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  const invalid = tokens.some((item) => !HEX.test(values[item.key]));
  const changed = tokens.filter((item) => values[item.key].toLowerCase() !== item.default.toLowerCase()).length
    + FONT_SLOTS.filter((slot) => fontChoice[slot] !== DEFAULT_FONTS[slot]).length
    + (Object.keys(DEFAULT_LAYOUT) as Array<keyof LayoutSettings>).filter((name) => layout[name] !== DEFAULT_LAYOUT[name]).length;

  const contrast = useMemo(() => {
    const resolve = (ref: string) => (ref.startsWith("#") ? ref : values[ref]);
    return CONTRAST_PAIRS.map((pair) => {
      const fg = resolve(pair.fg);
      const bg = resolve(pair.bg);
      const ratio = HEX.test(fg) && HEX.test(bg) ? contrastRatio(fg, bg) : 0;
      return { ...pair, fg, bg, ratio, level: ratio >= 4.5 ? "pass" : ratio >= 3 ? "large" : "fail" } as const;
    });
  }, [values]);
  const threshold = POLICY_THRESHOLD[policy];
  const blocking = threshold > 0 ? contrast.filter((item) => item.ratio < threshold).length : 0;
  const hardToRead = contrast.filter((item) => item.level === "fail").length;

  function applyPreset(preset: ThemePreset) {
    setValues({ ...defaults, ...preset.colors });
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values, fonts: fontChoice, layout, policy }),
    });
    setSaving(false);
    const data = await response.json().catch(() => null);
    setFailed(!response.ok);
    setMessage(response.ok ? t("adm.theme.saved") : data?.code === "LOW_CONTRAST" ? t("adm.theme.blockedByPolicy", { count: data.pairs?.length ?? 0 }) : t("adm.theme.errSave"));
    if (response.ok) router.refresh();
  }

  function resetAll() {
    setValues({ ...defaults });
    setFontChoice({ ...DEFAULT_FONTS });
    setLayout({ ...DEFAULT_LAYOUT });
  }

  const optionFor = (slot: FontSlotKey, key: string) => fontOptionsFor(slot, customFonts).find((font) => font.key === key);
  const fontFamily = (slot: FontSlotKey) => {
    const option = optionFor(slot, fontChoice[slot]);
    return option && option.key !== "system" ? `var(${option.cssVar})` : "Tahoma, 'Segoe UI', Arial, sans-serif";
  };

  // Aperçu : les rayons Tailwind sont calculés à la racine ; on les redéfinit dans l'aperçu.
  const previewVars = {
    "--radius-md": `calc(0.375rem * ${layout.radius})`,
    "--radius-lg": `calc(0.5rem * ${layout.radius})`,
    "--radius-xl": `calc(0.75rem * ${layout.radius})`,
    "--radius-2xl": `calc(1rem * ${layout.radius})`,
    "--radius-3xl": `calc(1.5rem * ${layout.radius})`,
  } as React.CSSProperties;

  async function uploadCustomFont(slot: number, name: string, file: File) {
    const formData = new FormData();
    formData.set("slot", String(slot));
    formData.set("name", name);
    formData.set("file", file);
    const response = await fetch("/api/admin/fonts", { method: "POST", body: formData });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setFailed(true);
      setMessage(data?.code === "FILE_BAD_TYPE" ? t("adm.theme.fontBadType") : data?.code === "FILE_TOO_LARGE" ? t("adm.theme.fontTooLarge") : t("adm.theme.fontUploadFailed"));
      return;
    }
    setCustomFonts((current) => [...current.filter((font) => font.slot !== slot), data.font].sort((a, b) => a.slot - b.slot));
    setFailed(false);
    setMessage(t("adm.theme.fontUploaded"));
    router.refresh();
  }

  async function removeCustomFont(slot: number) {
    const response = await fetch(`/api/admin/fonts?slot=${slot}`, { method: "DELETE" });
    if (!response.ok) return;
    setCustomFonts((current) => current.filter((font) => font.slot !== slot));
    setFontChoice((current) => Object.fromEntries(FONT_SLOTS.map((s) => [s, current[s] === `custom${slot}` ? DEFAULT_FONTS[s] : current[s]])) as Record<FontSlotKey, string>);
    router.refresh();
  }

  const sliders = [
    { name: "radius", label: "adm.theme.radius", format: (v: number) => (v === 0 ? t("adm.theme.radiusSharp") : `${Math.round(v * 100)} %`) },
    { name: "width", label: "adm.theme.width", format: (v: number) => `${v} px` },
    { name: "section", label: "adm.theme.sectionSpacing", format: (v: number) => `${Math.round(v * 100)} %` },
  ] as const;

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">{t("adm.theme.eyebrow")}</p>
          <h1 className="text-[25px] text-navy sm:text-[30px]">{t("adm.theme.title")}</h1>
          <p className="mt-2 max-w-2xl text-[13.5px] text-muted">{t(changed > 1 ? "adm.theme.introMany" : "adm.theme.introOne", { count: changed })}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={resetAll} className="rounded-xl border border-line bg-white px-5 py-3 text-[13px] font-semibold text-muted transition hover:text-navy">{t("adm.theme.reset")}</button>
          <button type="button" onClick={save} disabled={saving || invalid || blocking > 0} className="rounded-xl bg-blue px-6 py-3 text-[13.5px] font-semibold text-white transition hover:bg-blue-2 disabled:opacity-60">{saving ? t("adm.saving") : t("adm.content.publish")}</button>
        </div>
      </div>

      {message && <div role="status" className={`mb-5 rounded-xl border px-4 py-3 text-[13px] ${failed ? "border-danger-line bg-danger-soft text-danger" : "border-ok/30 bg-ok-soft text-ok"}`}>{message}</div>}
      {blocking > 0 && <div role="alert" className="mb-5 rounded-xl border border-caution-line bg-caution-soft px-4 py-3 text-[13px] text-caution">{t("adm.theme.blockedByPolicy", { count: blocking })}</div>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <section className="rounded-2xl border border-edge bg-white p-5 shadow-[0_8px_28px_rgba(20,40,77,.04)] sm:p-6">
            <h2 className="text-[16px] text-navy">{t("adm.theme.section.presets")}</h2>
            <p className="mt-1 text-[12.5px] text-muted">{t("adm.theme.section.presetsHint")}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {presets.map((preset) => {
                const c = { ...defaults, ...preset.colors };
                return (
                  <button key={preset.key} type="button" onClick={() => applyPreset(preset)} className="rounded-xl border border-edge bg-surface p-3 text-start transition hover:-translate-y-0.5 hover:border-blue/40">
                    <span className="flex h-9 overflow-hidden rounded-lg border border-edge" aria-hidden="true">
                      {[c.navy, c.blue, c["blue-soft"], c.seal, c.mist].map((color, index) => <span key={index} className="flex-1" style={{ background: color }} />)}
                    </span>
                    <span className="mt-2 block text-[12.5px] font-semibold text-navy">{t(`adm.theme.preset.${preset.key}`)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-edge bg-white p-5 shadow-[0_8px_28px_rgba(20,40,77,.04)] sm:p-6">
            <h2 className="text-[16px] text-navy">{t("adm.theme.section.layout")}</h2>
            <p className="mt-1 text-[12.5px] text-muted">{t("adm.theme.section.layoutHint")}</p>
            <div className="mt-4 grid gap-5">
              {sliders.map((slider) => {
                const limits = layoutLimits[slider.name];
                return (
                  <div key={slider.name}>
                    <div className="mb-1.5 flex items-center justify-between text-[13px]"><label htmlFor={`layout-${slider.name}`} className="font-semibold text-ink">{t(slider.label)}</label><span className="font-mono text-[12px] text-muted">{slider.format(layout[slider.name])}</span></div>
                    <input id={`layout-${slider.name}`} type="range" min={limits.min} max={limits.max} step={limits.step} value={layout[slider.name]} onChange={(event) => setLayout((current) => ({ ...current, [slider.name]: Number(event.target.value) }))} className="w-full accent-[var(--color-blue)]" />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-edge bg-white p-5 shadow-[0_8px_28px_rgba(20,40,77,.04)] sm:p-6">
            <h2 className="text-[16px] text-navy">{t("adm.theme.section.fonts")}</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {([
                ["heading", "adm.theme.fontHeading", "adm.theme.fontSampleHeading", false],
                ["body", "adm.theme.fontBody", "adm.theme.fontSampleBody", false],
                ["headingAr", "adm.theme.fontHeadingAr", "adm.theme.fontSampleHeadingAr", true],
                ["bodyAr", "adm.theme.fontBodyAr", "adm.theme.fontSampleBodyAr", true],
              ] as const).map(([slot, label, sample, rtl]) => (
                <div key={slot}>
                  <label htmlFor={`font-${slot}`} className="mb-1.5 block text-[13px] font-semibold text-ink">{t(label)}</label>
                  <select id={`font-${slot}`} value={fontChoice[slot]} onChange={(event) => setFontChoice((current) => ({ ...current, [slot]: event.target.value }))} className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] text-ink outline-none focus:border-blue">
                    {fontOptionsFor(slot, customFonts).map((font) => <option key={font.key} value={font.key}>{font.label}</option>)}
                  </select>
                  <p dir={rtl ? "rtl" : "ltr"} className={`mt-3 rounded-xl border border-edge bg-surface p-4 text-ink ${slot.startsWith("heading") ? "text-[20px] font-semibold" : "text-[14px] leading-6"}`} style={{ fontFamily: fontFamily(slot) }}>{t(sample)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-edge pt-5">
              <h3 className="text-[14px] font-semibold text-navy">{t("adm.theme.customFontsTitle")}</h3>
              <p className="mt-1 text-[12px] text-muted">{t("adm.theme.customFontsHint")}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {CUSTOM_FONT_SLOTS.map((slot) => {
                  const current = customFonts.find((font) => font.slot === slot);
                  return <CustomFontSlotCard key={slot} slot={slot} current={current} onUpload={uploadCustomFont} onRemove={removeCustomFont} />;
                })}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-edge bg-white shadow-[0_8px_28px_rgba(20,40,77,.04)]">
            <div className="border-b border-edge px-5 py-4 sm:px-6"><h2 className="text-[16px] text-navy">{t("adm.theme.section.colors")}</h2></div>
            {THEME_GROUPS.map((group) => (
              <div key={group} className="border-b border-edge last:border-b-0">
                <h3 className="bg-surface px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted sm:px-6">{t(`adm.theme.group.${group}`)}</h3>
                {tokens.filter((item) => item.group === group).map((item) => {
                  const value = values[item.key];
                  const valid = HEX.test(value);
                  return (
                    <div key={item.key} className="flex flex-wrap items-center gap-4 border-t border-edge px-5 py-3.5 sm:px-6">
                      <input type="color" aria-label={tokenLabel(item.key)} value={valid ? value : item.default} onChange={(event) => setValues((current) => ({ ...current, [item.key]: event.target.value }))} className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-white p-1" />
                      <div className="min-w-[170px] flex-1"><div className="text-[13.5px] font-semibold text-navy">{tokenLabel(item.key)}</div><div className="text-[11.5px] text-muted">{tokenHint(item.key)}</div></div>
                      <input value={value} onChange={(event) => setValues((current) => ({ ...current, [item.key]: event.target.value }))} spellCheck={false} maxLength={7} aria-label={`${tokenLabel(item.key)} (hex)`} className={`w-28 rounded-lg border px-3 py-2 font-mono text-[12.5px] outline-none focus:border-blue ${valid ? "border-line" : "border-danger"}`} />
                      <button type="button" onClick={() => setValues((current) => ({ ...current, [item.key]: item.default }))} disabled={value.toLowerCase() === item.default.toLowerCase()} className="text-[12px] font-semibold text-muted hover:text-blue disabled:opacity-30">{t("adm.theme.default")}</button>
                    </div>
                  );
                })}
              </div>
            ))}
          </section>
        </div>

        <aside className="grid h-fit gap-5 lg:sticky lg:top-[92px]">
          <div className="rounded-2xl border border-line p-5 shadow-[0_8px_28px_rgba(20,40,77,.04)]" style={{ background: values.mist, ...previewVars }}>
            <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: values.muted }}>{t("adm.theme.preview")}</p>
            <div className="rounded-xl p-5" style={{ background: values.navy }}>
              <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: values["accent-light"] }}>{t("adm.theme.previewBrand")}</div>
              <div className="mt-1 text-[20px] text-white" style={{ fontFamily: fontFamily("heading") }}>{t("adm.theme.previewTitle")}</div>
            </div>
            <div className="mt-3 rounded-xl border p-4" style={{ background: values.paper, borderColor: values.edge }}>
              <div className="text-[17px]" style={{ color: values.navy, fontFamily: fontFamily("heading") }}>{t("adm.theme.previewCard")}</div>
              <p className="mt-1 text-[12.5px]" style={{ color: values.muted, fontFamily: fontFamily("body") }}>{t("adm.theme.previewMuted")}</p>
              <p className="mt-1 text-[12.5px]" style={{ color: values.ink, fontFamily: fontFamily("body") }}>{t("adm.theme.previewInk")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-lg px-3 py-2 text-[12px] font-semibold text-white" style={{ background: values.blue }}>{t("adm.theme.previewButton")}</span>
                <span className="rounded-lg px-3 py-2 text-[12px] font-semibold" style={{ background: values["blue-soft"], color: values["blue-2"] }}>{t("adm.theme.previewAccent")}</span>
                <span className="rounded-lg px-3 py-2 text-[12px] font-semibold text-white" style={{ background: values.ok }}>{t("adm.theme.previewOk")}</span>
                <span className="rounded-lg px-3 py-2 text-[12px] font-semibold" style={{ background: values["caution-soft"], color: values.caution, border: `1px solid ${values["caution-line"]}` }}>{t("adm.theme.previewWarn")}</span>
                <span className="rounded-lg px-3 py-2 text-[12px] font-semibold" style={{ background: values["danger-soft"], color: values.danger, border: `1px solid ${values["danger-line"]}` }}>!</span>
                <span className="rounded-lg px-3 py-2 text-[12px] font-semibold text-white" style={{ background: values.seal }}>{t("adm.theme.previewSeal")}</span>
              </div>
            </div>
            <p className="mt-3 text-[11px]" style={{ color: values.muted }}>{t("adm.theme.logoNote")}</p>
          </div>

          <div className="rounded-2xl border border-edge bg-white p-5 shadow-[0_8px_28px_rgba(20,40,77,.04)]">
            <h2 className="text-[15px] text-navy">{t("adm.theme.section.contrast")}</h2>
            <p className="mt-1 text-[11.5px] text-muted">{t("adm.theme.contrastHint")}</p>
            <label htmlFor="policy" className="mt-3 block text-[12px] font-semibold text-ink">{t("adm.theme.policyTitle")}</label>
            <select id="policy" value={policy} onChange={(event) => setPolicy(event.target.value as ContrastPolicy)} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[12.5px] text-ink outline-none focus:border-blue">
              {CONTRAST_POLICIES.map((option) => <option key={option} value={option}>{t(`adm.theme.policy.${option}`)}</option>)}
            </select>
            <p className={`mt-3 text-[12.5px] font-semibold ${hardToRead ? "text-caution" : "text-ok"}`}>{hardToRead ? t("adm.theme.contrastIssues", { count: hardToRead }) : t("adm.theme.contrastAllOk")}</p>
            <ul className="mt-3 grid gap-2">
              {contrast.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-[12px]">
                  <span className="grid h-8 w-10 shrink-0 place-items-center rounded-md border border-edge text-[12px] font-bold" style={{ background: item.bg, color: item.fg }}>Aa</span>
                  <span className="min-w-0 flex-1 truncate text-ink">{t(`adm.theme.contrast.${item.id}`)}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${item.level === "pass" ? "bg-ok-soft text-ok" : item.level === "large" ? "bg-caution-soft text-caution" : "bg-danger-soft text-danger"}`} title={t(item.level === "pass" ? "adm.theme.contrastPass" : item.level === "large" ? "adm.theme.contrastLarge" : "adm.theme.contrastFail")}>
                    {item.ratio.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CustomFontSlotCard({ slot, current, onUpload, onRemove }: {
  slot: number;
  current: CustomFont | undefined;
  onUpload: (slot: number, name: string, file: File) => Promise<void>;
  onRemove: (slot: number) => Promise<void>;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(current?.name ?? "");
  const [busy, setBusy] = useState(false);
  return (
    <div className="rounded-xl border border-edge bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-semibold text-navy">{t("adm.theme.customSlot", { n: slot })}</span>
        {current && <button type="button" onClick={() => onRemove(slot)} className="text-[12px] font-semibold text-danger hover:underline">{t("adm.delete")}</button>}
      </div>
      {current && <p className="mt-1 truncate text-[12px] text-ok">{t("adm.theme.customActive", { name: current.name })}</p>}
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t("adm.theme.customName")} maxLength={60} className="mt-3 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-blue" />
      <label className={`mt-2 inline-flex cursor-pointer items-center rounded-lg border border-line bg-white px-3 py-2 text-[12.5px] font-semibold text-navy transition hover:border-blue ${!name.trim() || busy ? "pointer-events-none opacity-50" : ""}`}>
        {busy ? t("adm.media.uploading") : t("adm.theme.customChoose")}
        <input type="file" accept=".woff2,font/woff2" disabled={!name.trim() || busy} className="hidden" onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setBusy(true);
          await onUpload(slot, name.trim(), file);
          setBusy(false);
        }} />
      </label>
    </div>
  );
}
