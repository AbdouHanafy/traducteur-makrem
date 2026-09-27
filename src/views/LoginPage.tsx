"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import AuthShell from "@/views/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn.email({ email, password });

    setLoading(false);

    if (signInError) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="Espace client"
      title="Suivez votre commande de traduction, du devis au téléchargement."
      subtitle="Chaque étape — acompte, traduction, solde, fichier débloqué — est visible en temps réel depuis votre espace."
    >
      <h1 className="text-[26px] text-navy">Connexion</h1>
      <p className="mt-1.5 text-[14.5px] text-muted">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-semibold text-blue hover:text-blue-2">
          Créer un compte
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4.5" noValidate>
        {error && (
          <div className="rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-blue"
            placeholder="vous@exemple.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-blue"
            placeholder="••••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 inline-flex items-center justify-center rounded-[11px] bg-blue px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_22px_rgba(36,86,184,.28)] transition-colors hover:bg-blue-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </AuthShell>
  );
}
