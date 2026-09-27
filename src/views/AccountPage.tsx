"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AccountPage({ email, name }: { email: string; name: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setLoading(false);

    if (changeError) {
      setError(
        changeError.status === 400
          ? "Mot de passe actuel incorrect."
          : changeError.message || "Impossible de modifier le mot de passe.",
      );
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="mx-auto max-w-[760px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mb-8">
        <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">Sécurité & identité</p>
        <h1 className="text-[27px] text-navy sm:text-[30px]">Mon compte</h1>
        <p className="mt-2 text-[13.5px] text-muted">Consultez vos informations et sécurisez votre accès.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-[#e4e9f1] bg-white p-6 shadow-[0_8px_25px_rgba(20,40,77,0.04)]">
        <h2 className="mb-3 text-[15px] font-semibold text-navy">Informations</h2>
        <p className="text-[14px] text-ink">{name}</p>
        <p className="text-[14px] text-muted">{email}</p>
      </div>

      <div className="rounded-2xl border border-[#e4e9f1] bg-white p-6 shadow-[0_8px_25px_rgba(20,40,77,0.04)]">
        <h2 className="mb-1 text-[15px] font-semibold text-navy">Changer mon mot de passe</h2>
        <p className="mb-5 text-[13.5px] text-muted">
          Vous pouvez modifier le mot de passe défini lors de votre commande à tout moment.
        </p>

        <form onSubmit={onSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-[10px] border border-[#bfe3c8] bg-[#eaf7ee] px-4 py-3 text-[13.5px] text-[#2c6e3f]">
              Mot de passe modifié avec succès.
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Mot de passe actuel</label>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Nouveau mot de passe</label>
            <input
              required
              type="password"
              minLength={10}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="10 caractères minimum"
              className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
              Confirmer le nouveau mot de passe
            </label>
            <input
              required
              type="password"
              minLength={10}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-[11px] bg-blue px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Modification…" : "Modifier le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
