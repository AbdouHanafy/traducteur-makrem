"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import AuthShell from "@/views/components/AuthShell";
import { useI18n } from "@/views/components/I18nProvider";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCallback = searchParams.get("callbackUrl");
  const callbackUrl = requestedCallback?.startsWith("/") && !requestedCallback.startsWith("//") ? requestedCallback : "/dashboard";

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
      setError(t("login.error"));
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow={t("login.eyebrow")}
      title={t("login.sideTitle")}
      subtitle={t("login.sideSubtitle")}
    >
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-blue">{t("login.secure")}</p>
      <h1 className="text-[27px] text-navy">{t("login.welcome")}</h1>
      <p className="mt-1.5 text-[14.5px] text-muted">
        {t("login.noAccount")} {" "}
        <Link href="/register" className="font-semibold text-blue hover:text-blue-2">
          {t("login.create")}
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-7 grid gap-4.5" noValidate>
        {error && (
          <div className="rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            {t("common.email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-blue focus:ring-3 focus:ring-blue/10"
            placeholder="vous@exemple.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            {t("common.password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-blue focus:ring-3 focus:ring-blue/10"
            placeholder="••••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 inline-flex items-center justify-center rounded-xl bg-blue px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_22px_rgba(36,86,184,.22)] transition hover:bg-blue-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t("login.loading") : t("login.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
