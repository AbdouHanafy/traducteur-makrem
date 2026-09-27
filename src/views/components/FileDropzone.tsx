"use client";

import { useRef, useState } from "react";

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Zone de dépôt de fichier — remplace l'input natif brut ("Choose File / No file chosen",
 * non stylable et peu clair pour l'utilisateur) par une zone cliquable + glisser-déposer qui
 * affiche clairement le fichier sélectionné.
 */
export default function FileDropzone({
  file,
  onChange,
  accept,
  hint,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onChange(dropped);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="hidden"
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-blue/20 bg-blue-soft/60 px-4 py-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-blue-soft text-blue-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-medium text-ink">{file.name}</div>
            <div className="text-[12px] text-muted">{formatSize(file.size)}</div>
          </div>
          <button
            type="button"
            onClick={openPicker}
            className="shrink-0 text-[13px] font-semibold text-blue hover:text-blue-2"
          >
            Changer
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Retirer le fichier"
            className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-white hover:text-[#9c2c2c]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-9 text-center transition-all ${
            dragOver ? "scale-[1.01] border-blue bg-blue-soft" : "border-[#ccd5e3] bg-[#f8f9fc] hover:border-blue hover:bg-blue-soft/40"
          }`}
        >
          <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-blue-2 shadow-[var(--shadow-sm)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 16V4m0 0L7 9m5-5l5 5" />
              <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-ink">
            <span className="text-blue">Cliquez pour choisir un fichier</span> ou glissez-le ici
          </p>
          <p className="text-[12.5px] text-muted">{hint}</p>
        </div>
      )}
    </div>
  );
}
