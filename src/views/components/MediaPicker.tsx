"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/views/components/I18nProvider";

interface MediaItem {
  id: string;
  url: string;
  originalName: string;
  altText: string | null;
}

/**
 * Sélecteur d'image réutilisable (médiathèque) — pensé pour être branché sur n'importe quel
 * champ "image" du backoffice (services aujourd'hui, articles / sections de la home ensuite).
 */
export default function MediaPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    async function load() {
      setLoading(true);
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setItems(data.media ?? []);
      setLoading(false);
    }

    load();
  }, [open]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    const res = await fetch("/api/admin/media", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || t("adm.media.errUpload"));
      return;
    }

    const data = await res.json();
    onChange(data.media.url);
    setOpen(false);
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-16 w-16 rounded-[8px] border border-line object-cover" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-[8px] border border-dashed border-line text-[11px] text-muted">
            {t("adm.picker.none")}
          </div>
        )}
        <div className="grid gap-1.5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-[8px] border border-line px-3 py-1.5 text-[13px] font-semibold text-navy hover:border-blue"
          >
            {open ? t("adm.picker.close") : t("adm.picker.choose")}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[12.5px] text-muted hover:text-[#9c2c2c]"
            >
              {t("adm.picker.remove")}
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-3 rounded-[10px] border border-line bg-white p-4">
          {error && (
            <div className="mb-3 rounded-[8px] border border-[#f3c6c6] bg-[#fdecec] px-3 py-2 text-[12.5px] text-[#9c2c2c]">
              {error}
            </div>
          )}

          <label className="mb-3 block">
            <span className="mb-1.5 block text-[12.5px] font-semibold text-ink">
              {uploading ? t("adm.picker.uploadingLong") : t("adm.picker.uploadNew")}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={onUpload}
              className="w-full rounded-[8px] border border-dashed border-line bg-mist px-3 py-2 text-[13px]"
            />
          </label>

          {loading ? (
            <p className="text-[13px] text-muted">{t("adm.picker.loading")}</p>
          ) : items.length === 0 ? (
            <p className="text-[13px] text-muted">{t("adm.picker.emptyLibrary")}</p>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    onChange(item.url);
                    setOpen(false);
                  }}
                  title={item.originalName}
                  className="aspect-square overflow-hidden rounded-[8px] border border-line hover:border-blue"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.altText ?? ""} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
