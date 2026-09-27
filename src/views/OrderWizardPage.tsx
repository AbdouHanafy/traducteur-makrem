"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Topbar from "@/views/components/Topbar";
import Footer from "@/views/components/Footer";
import FileDropzone from "@/views/components/FileDropzone";
import { DELAY_OPTIONS } from "@/repositories/pricingRules";
import { signUp, useSession } from "@/lib/auth-client";

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

/** "Sarra Ben Ali" -> { firstName: "Sarra", lastName: "Ben Ali" } — un seul champ à
 * remplir côté utilisateur, Better Auth exige les deux séparément côté schéma. */
function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed, lastName: trimmed };
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) };
}

export default function OrderWizardPage({ services }: { services: ServiceOption[] }) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();

  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [sourceLang, setSourceLang] = useState("ar");
  const [targetLang, setTargetLang] = useState("fr");
  const [pages, setPages] = useState(1);
  const [delayKey, setDelayKey] = useState<string>(DELAY_OPTIONS[0].key);
  const [file, setFile] = useState<File | null>(null);
  const [account, setAccount] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedService = services.find((s) => s.id === serviceId);
  const estimatedTotal = selectedService ? Number(selectedService.pricePerPage) * pages : 0;
  const needsAccount = !sessionPending && !session;

  function updateAccount(field: keyof typeof account) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setAccount((a) => ({ ...a, [field]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Merci de déposer votre document.");
      return;
    }

    setLoading(true);

    // Visiteur non connecté : le compte est créé à partir des informations du formulaire,
    // puis la commande est soumise avec la session qui vient de s'ouvrir — un seul geste pour
    // le client, pas un aller-retour "créez d'abord un compte, puis recommencez".
    if (needsAccount) {
      const { firstName, lastName } = splitFullName(account.fullName);
      const { error: signUpError } = await signUp.email({
        name: account.fullName.trim(),
        email: account.email,
        password: account.password,
        firstName,
        lastName,
        phone: account.phone || undefined,
      });

      if (signUpError) {
        setLoading(false);
        setError(
          signUpError.status === 422
            ? "Un compte existe déjà avec cette adresse email. Connectez-vous puis réessayez."
            : signUpError.message || "Impossible de créer le compte. Vérifiez les informations.",
        );
        return;
      }
    }

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
    router.refresh();
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
            {needsAccount && (
              <p className="mt-3 max-w-[56ch] text-[14.5px] text-[#c4d2ea]">
                Pas besoin de créer un compte avant de commander : indiquez vos coordonnées
                ci-dessous, votre espace client sera créé automatiquement avec votre commande.
              </p>
            )}
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

                {needsAccount && (
                  <div className="grid gap-4 border-b border-line pb-6">
                    <h2 className="text-[15px] font-semibold text-navy">Vos coordonnées</h2>
                    <div>
                      <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Nom complet</label>
                      <input
                        required
                        value={account.fullName}
                        onChange={updateAccount("fullName")}
                        autoComplete="name"
                        placeholder="Sarra Ben Ali"
                        className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Email</label>
                        <input
                          required
                          type="email"
                          value={account.email}
                          onChange={updateAccount("email")}
                          autoComplete="email"
                          placeholder="vous@exemple.com"
                          className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Téléphone</label>
                        <input
                          required
                          type="tel"
                          value={account.phone}
                          onChange={updateAccount("phone")}
                          autoComplete="tel"
                          placeholder="(+216) 22 200 170"
                          className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Mot de passe</label>
                      <input
                        required
                        type="password"
                        minLength={10}
                        value={account.password}
                        onChange={updateAccount("password")}
                        autoComplete="new-password"
                        placeholder="10 caractères minimum"
                        className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
                      />
                      <p className="mt-1.5 text-[12.5px] text-muted">
                        Utilisé pour retrouver vos commandes ensuite — modifiable à tout moment
                        depuis votre espace client.
                      </p>
                    </div>
                    <p className="text-[13px] text-muted">
                      Déjà client ?{" "}
                      <Link href="/login?callbackUrl=/commander" className="font-semibold text-blue hover:text-blue-2">
                        Connectez-vous
                      </Link>{" "}
                      pour retrouver vos commandes.
                    </p>
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
                  <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Document source</label>
                  <FileDropzone
                    file={file}
                    onChange={setFile}
                    accept=".pdf,.jpg,.jpeg,.png"
                    hint="PDF, JPEG ou PNG — 20 Mo max"
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
                  disabled={loading || sessionPending}
                  className="inline-flex items-center justify-center rounded-[11px] bg-blue px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? needsAccount
                      ? "Création du compte et envoi…"
                      : "Envoi en cours…"
                    : "Obtenir mon devis"}
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
