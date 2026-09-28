"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaPicker from "@/views/components/MediaPicker";

export interface PartnerRow {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  active: boolean;
}

type FormValues = Omit<PartnerRow, "id">;
const EMPTY: FormValues = { name: "", logoUrl: "", websiteUrl: "", active: true };

function PartnerForm({ initial, submitLabel, onSubmit, onCancel }: {
  initial: FormValues;
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <form onSubmit={async (event) => { event.preventDefault(); setLoading(true); setError(""); try { await onSubmit(form); } catch (reason) { setError(reason instanceof Error ? reason.message : "Une erreur est survenue."); } finally { setLoading(false); } }} className="grid gap-4">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1.5 block text-[12.5px] font-semibold text-ink">Nom du partenaire</label><input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-line px-4 py-3 text-[14px] outline-none focus:border-blue" /></div>
        <div><label className="mb-1.5 block text-[12.5px] font-semibold text-ink">Site web <span className="font-normal text-muted">(optionnel)</span></label><input type="url" value={form.websiteUrl} onChange={(event) => setForm((current) => ({ ...current, websiteUrl: event.target.value }))} placeholder="https://exemple.com" className="w-full rounded-xl border border-line px-4 py-3 text-[14px] outline-none focus:border-blue" /></div>
      </div>
      <div><label className="mb-2 block text-[12.5px] font-semibold text-ink">Logo</label><MediaPicker value={form.logoUrl} onChange={(logoUrl) => setForm((current) => ({ ...current, logoUrl }))} /></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <label className="flex items-center gap-2 text-[13px] text-ink"><input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} className="h-4 w-4" />Visible sur le site</label>
        <div className="flex gap-2"><button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-muted">Annuler</button><button type="submit" disabled={loading} className="rounded-xl bg-blue px-5 py-2.5 text-[12.5px] font-semibold text-white hover:bg-blue-2 disabled:opacity-60">{loading ? "Enregistrement…" : submitLabel}</button></div>
      </div>
    </form>
  );
}

export default function AdminPartnersPage({ partners }: { partners: PartnerRow[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function request(url: string, method: string, body?: unknown) {
    const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    if (!response.ok) { const data = await response.json().catch(() => null); throw new Error(data?.error ?? "Impossible d'enregistrer."); }
  }

  return (
    <div className="mx-auto max-w-[920px] px-4 py-9 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[.18em] text-blue">Références</p><h1 className="text-[26px] text-navy sm:text-[30px]">Partenaires & institutions</h1><p className="mt-2 max-w-2xl text-[13px] text-muted">Ajoutez uniquement des partenaires réels et autorisés. Les logos publiés apparaissent directement sous le hero.</p></div>
        {!adding && <button type="button" onClick={() => setAdding(true)} className="shrink-0 rounded-xl bg-blue px-5 py-3 text-[13px] font-semibold text-white hover:bg-blue-2">Ajouter un partenaire</button>}
      </div>

      {adding && <div className="mb-5 rounded-2xl border border-blue/20 bg-white p-5 shadow-sm sm:p-6"><PartnerForm initial={EMPTY} submitLabel="Ajouter" onCancel={() => setAdding(false)} onSubmit={async (values) => { await request("/api/admin/partners", "POST", values); setAdding(false); router.refresh(); }} /></div>}

      {partners.length === 0 && !adding && <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center"><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-blue-soft text-blue"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg></div><p className="font-semibold text-navy">Aucun partenaire ajouté</p><p className="mt-1 text-[12.5px] text-muted">Le site affiche pour le moment les catégories d&apos;institutions, sans prétendre à un partenariat.</p></div>}

      <div className="grid gap-3">
        {partners.map((partner, index) => (
          <div key={partner.id} className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_25px_rgba(20,40,77,.04)]">
            {editingId === partner.id ? <PartnerForm initial={{ name: partner.name, logoUrl: partner.logoUrl, websiteUrl: partner.websiteUrl, active: partner.active }} submitLabel="Enregistrer" onCancel={() => setEditingId(null)} onSubmit={async (values) => { await request(`/api/admin/partners/${partner.id}`, "PATCH", values); setEditingId(null); router.refresh(); }} /> : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="grid h-20 w-full shrink-0 place-items-center rounded-xl border border-line bg-[#fafbfc] p-3 sm:w-32">{partner.logoUrl ? <img src={partner.logoUrl} alt={`Logo ${partner.name}`} className="h-full w-full object-contain" /> : <span className="text-center text-[12px] font-bold uppercase tracking-wide text-muted">{partner.name}</span>}</div>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-[16px] text-navy">{partner.name}</h2>{!partner.active && <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-bold uppercase text-muted">Masqué</span>}</div>{partner.websiteUrl && <p className="mt-1 truncate text-[12px] text-muted">{partner.websiteUrl}</p>}</div>
                <div className="flex shrink-0 items-center gap-1 border-t border-line pt-3 sm:border-0 sm:pt-0"><button type="button" disabled={index === 0} onClick={async () => { await request(`/api/admin/partners/${partner.id}/move`, "POST", { direction: "up" }); router.refresh(); }} className="rounded-lg p-2 text-muted hover:bg-mist disabled:opacity-25" aria-label="Monter">↑</button><button type="button" disabled={index === partners.length - 1} onClick={async () => { await request(`/api/admin/partners/${partner.id}/move`, "POST", { direction: "down" }); router.refresh(); }} className="rounded-lg p-2 text-muted hover:bg-mist disabled:opacity-25" aria-label="Descendre">↓</button><button type="button" onClick={() => setEditingId(partner.id)} className="ms-2 text-[12.5px] font-semibold text-blue">Modifier</button><button type="button" onClick={async () => { if (!confirm(`Supprimer ${partner.name} ?`)) return; await request(`/api/admin/partners/${partner.id}`, "DELETE"); router.refresh(); }} className="ms-2 text-[12.5px] font-semibold text-red-600">Supprimer</button></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
