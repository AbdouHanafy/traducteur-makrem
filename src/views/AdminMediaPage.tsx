"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/views/components/I18nProvider";

export interface MediaRow {
  id: string;
  url: string;
  originalName: string;
  altText: string | null;
  sizeBytes: number;
  createdAt: string;
}

export default function AdminMediaPage({ items }: { items: MediaRow[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    const res = await fetch("/api/admin/media", { method: "POST", body: formData });
    setUploading(false);
    e.target.value = "";

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || t("adm.media.errUpload"));
      return;
    }

    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(t("adm.media.deleteConfirm"))) return;
    setError(null);
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (res.status === 409) {
      setError(t("adm.media.errInUse"));
      return;
    }
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] text-navy sm:text-[26px]">{t("adm.media.title")}</h1>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-[11px] bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2">
          {uploading ? t("adm.media.uploading") : t("adm.media.upload")}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={onUpload}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="mb-5 rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-white p-10 text-center text-muted">
          {t("adm.media.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-[12px] border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.altText ?? ""} className="aspect-square w-full object-cover" />
              <div className="p-3">
                <div className="truncate text-[12.5px] font-medium text-ink" title={item.originalName}>
                  {item.originalName}
                </div>
                <div className="mt-0.5 text-[11px] text-muted">{t("adm.media.sizeKb", { size: Math.round(item.sizeBytes / 1024) })}</div>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="mt-2 text-[12px] font-semibold text-muted hover:text-[#9c2c2c]"
                >
                  {t("adm.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
