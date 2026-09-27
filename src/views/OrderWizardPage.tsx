"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import { DELAY_OPTIONS } from "@/repositories/pricingRules";

interface ServiceOption {
  id: string;
  name: string;
  pricePerPage: string;
}

const LANGUAGES = [
  { value: "fr", label: "Français" },
  { value: "ar", label: "Arabe" },
  { value: "en", label: "Anglais" },
];

export default function OrderWizardPage({ services }: { services: ServiceOption[] }) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [sourceLang, setSourceLang] = useState("ar");
  const [targetLang, setTargetLang] = useState("fr");
  const [pages, setPages] = useState(1);
  const [delayKey, setDelayKey] = useState<string>(DELAY_OPTIONS[0].key);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedService = services.find((s) => s.id === serviceId);
  const estimatedTotal = selectedService ? Number(selectedService.pricePerPage) * pages : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Merci de déposer votre document.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("serviceId", serviceId);
    formData.set("sourceLang", sourceLang);
    formData.set("targetLang", targetLang);
    formData.set("pages", String(pages));
    formData.set("delayKey", delayKey);
    formData.set("file", file);

    const res = await fetch("/api/orders", { method: "POST", body: formData });
    setLoading(false);

    if (res.status === 401) {
      router.push("/login?callbackUrl=/commander");
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Une erreur est survenue.");
      return;
    }

    const data = await res.json();
    router.push(`/dashboard/orders/${data.id}`);
  }

  return (
    <>
      <Topbar />
      <main className="flex-1">
        <section className="bg-[linear-gradient(180deg,#0C1A34_0%,#14284D_100%)] py-16 text-white">
          <div className="mx-auto max-w-[820px] px-[22px]">
            <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#8fb4ff]">
              <span className="h-0.5 w-5.5 rounded bg-[#8fb4ff]" />
              Commander
            </span>
            <h1 className="text-[clamp(28px,3.6vw,38px)] text-white">
              Déposez votre document, recevez un devis immédiat
            </h1>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[820px] px-[22px]">
            {services.length === 0 ? (
              <div className="rounded-[14px] border border-line bg-white p-8 text-center text-muted">
                Aucun service disponible pour une commande en ligne pour le moment.{" "}
                <Link href="/contact" className="font-semibold text-blue">
                  Contactez-nous
                </Link>
                .
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-6 rounded-[16px] border border-line bg-white p-8">
                {error && (
                  <div className="rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Service</label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
                      Langue source
                    </label>
                    <select
                      value={sourceLang}
                      onChange={(e) => setSourceLang(e.target.value)}
                      className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
                      Langue cible
                    </label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
                      Nombre de pages
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={pages}
                      onChange={(e) => setPages(Number(e.target.value))}
                      className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Délai</label>
                    <select
                      value={delayKey}
                      onChange={(e) => setDelayKey(e.target.value)}
                      className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
                    >
                      {DELAY_OPTIONS.map((d) => (
                        <option key={d.key} value={d.key}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
                    Document source (PDF, JPEG ou PNG — 20 Mo max)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="w-full rounded-[10px] border border-dashed border-line bg-mist px-4 py-3 text-[14px] text-ink outline-none focus:border-blue"
                  />
                </div>

                {selectedService && (
                  <div className="rounded-[10px] bg-blue-soft px-4 py-3 text-[14px] text-navy">
                    Estimation : <b>{estimatedTotal.toFixed(3)} TND</b> (hors majoration de délai —
                    le devis exact avec délai appliqué est calculé à l&apos;étape suivante).
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-[11px] bg-blue px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Envoi en cours…" : "Obtenir mon devis"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
