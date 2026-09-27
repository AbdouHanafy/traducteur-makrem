"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  active: boolean;
}

function FaqForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: { question: string; answer: string; active: boolean };
  onSubmit: (values: { question: string; answer: string; active: boolean }) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [question, setQuestion] = useState(initial.question);
  const [answer, setAnswer] = useState(initial.answer);
  const [active, setActive] = useState(initial.active);
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit({ question, answer, active });
        setLoading(false);
      }}
      className="grid gap-3"
    >
      <input
        required
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question"
        className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
      />
      <textarea
        required
        rows={3}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Réponse"
        className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[14.5px] text-ink outline-none focus:border-blue"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13.5px] text-ink">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" />
          Publiée
        </label>
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="rounded-[9px] px-4 py-2 text-[13.5px] text-muted">
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-[9px] bg-blue px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-blue-2 disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function AdminFaqPage({ items }: { items: FaqRow[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function createFaq(values: { question: string; answer: string; active: boolean }) {
    await fetch("/api/admin/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setAdding(false);
    router.refresh();
  }

  async function updateFaq(id: string, values: { question: string; answer: string; active: boolean }) {
    await fetch(`/api/admin/faq/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setEditingId(null);
    router.refresh();
  }

  async function deleteFaq(id: string) {
    if (!confirm("Supprimer cette question ?")) return;
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function move(id: string, direction: "up" | "down") {
    await fetch(`/api/admin/faq/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[760px] px-6 py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] text-navy">FAQ</h1>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2"
          >
            Ajouter une question
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-5 rounded-[14px] border border-line bg-white p-5">
          <FaqForm
            initial={{ question: "", answer: "", active: true }}
            onSubmit={createFaq}
            onCancel={() => setAdding(false)}
            submitLabel="Ajouter"
          />
        </div>
      )}

      <div className="grid gap-3">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-[14px] border border-line bg-white p-5">
            {editingId === item.id ? (
              <FaqForm
                initial={item}
                onSubmit={(values) => updateFaq(item.id, values)}
                onCancel={() => setEditingId(null)}
                submitLabel="Enregistrer"
              />
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{item.question}</span>
                    {!item.active && (
                      <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-muted">
                        Non publiée
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13.5px] text-muted">{item.answer}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 border-t border-line pt-3 sm:border-t-0 sm:pt-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(item.id, "up")}
                    className="rounded-[7px] p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                    aria-label="Monter"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => move(item.id, "down")}
                    className="rounded-[7px] p-1.5 text-muted hover:bg-mist hover:text-navy disabled:opacity-30"
                    aria-label="Descendre"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(item.id)}
                    className="ml-2 text-[13px] font-semibold text-blue hover:text-blue-2"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFaq(item.id)}
                    className="ml-1 text-[13px] font-semibold text-muted hover:text-[#9c2c2c]"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
