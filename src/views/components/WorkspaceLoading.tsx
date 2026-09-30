"use client";

import { useI18n } from "@/views/components/I18nProvider";

export default function WorkspaceLoading() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-[1180px] animate-pulse px-4 py-8 sm:px-7 lg:px-10 lg:py-10" aria-label={t("app.loading")}>
      <div className="mb-8 h-3 w-28 rounded-full bg-slate-200" />
      <div className="mb-3 h-8 w-64 max-w-full rounded-lg bg-slate-200" />
      <div className="mb-8 h-4 w-96 max-w-full rounded bg-slate-200/80" />
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 rounded-2xl border border-[#e4e9f1] bg-white" />)}
      </div>
      <div className="h-72 rounded-2xl border border-[#e4e9f1] bg-white" />
    </div>
  );
}
