"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { useI18n } from "@/views/components/I18nProvider";
import AdminSiteEditor from "@/views/AdminSiteEditor";
import AdminSiteContentList from "@/views/AdminSiteContentList";

type LocaleValues = Record<Locale, Record<string, string>>;

interface ContentGroup {
  id: string;
  label: string;
  description: string;
  keys: string[];
}

/** Deux manières de modifier les textes : l'éditeur visuel (clic sur la page) ou la liste complète. */
export default function AdminSiteContentPage({ groups, defaults, overrides }: { groups: ContentGroup[]; defaults: LocaleValues; overrides: LocaleValues }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"visual" | "list">("visual");

  return (
    <div className="mx-auto max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">{t("adm.content.eyebrow")}</p>
          <h1 className="text-[25px] text-navy sm:text-[30px]">{t("adm.edit.title")}</h1>
        </div>
        <div className="inline-flex rounded-xl bg-mist p-1" role="tablist">
          {([["visual", "adm.edit.tabVisual"], ["list", "adm.edit.tabList"]] as const).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`rounded-lg px-4 py-2 text-[12.5px] font-semibold transition ${tab === id ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`}>{t(label)}</button>
          ))}
        </div>
      </div>

      {tab === "visual" ? <AdminSiteEditor defaults={defaults} overrides={overrides} /> : <AdminSiteContentList groups={groups} defaults={defaults} overrides={overrides} />}
    </div>
  );
}
