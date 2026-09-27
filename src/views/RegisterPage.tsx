"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import AuthShell from "@/views/components/AuthShell";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await signUp.email({
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || undefined,
    });

    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.status === 422
          ? "Un compte existe déjà avec cette adresse email."
          : signUpError.message || "Une erreur est survenue. Réessayez.",
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="Créer un compte"
      title="Un compte, toutes vos commandes de traduction au même endroit."
      subtitle="Déposez vos documents, réglez l'acompte, suivez la traduction et téléchargez vos actes certifiés une fois le solde payé."
    >
      <h1 className="text-[26px] text-navy">Créer un compte</h1>
      <p className="mt-1.5 text-[14.5px] text-muted">
        Déjà client ?{" "}
        <Link href="/login" className="font-semibold text-blue hover:text-blue-2">
          Se connecter
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4.5" noValidate>
        {error && (
          <div className="rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-[13.5px] font-semibold text-ink">
              Prénom
            </label>
            <input
              id="firstName"
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={update("firstName")}
              className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-blue"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-[13.5px] font-semibold text-ink">
              Nom
            </label>
            <input
              id="lastName"
              required
              autoComplete="family-name"
              value={form.lastName}
              onChange={update("lastName")}
              className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-blue"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-blue"
            placeholder="vous@exemple.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            Téléphone <span className="font-normal text-muted">(optionnel)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={update("phone")}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-blue"
            placeholder="(+216) 22 200 170"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={form.password}
            onChange={update("password")}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-blue"
            placeholder="10 caractères minimum"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 inline-flex items-center justify-center rounded-[11px] bg-blue px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_22px_rgba(36,86,184,.28)] transition-colors hover:bg-blue-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Création du compte…" : "Créer mon compte"}
        </button>
      </form>
    </AuthShell>
  );
}
