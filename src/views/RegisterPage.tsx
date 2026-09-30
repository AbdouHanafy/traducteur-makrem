"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import AuthShell from "@/views/components/AuthShell";
import { useI18n } from "@/views/components/I18nProvider";

export default function RegisterPage() {
  const { t } = useI18n();
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
        signUpError.code === "USER_ALREADY_EXISTS" || signUpError.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
          ? t("app.err.emailExists")
          : t("app.err.generic"),
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow={t("register.eyebrow")}
      title={t("register.sideTitle")}
      subtitle={t("register.sideSubtitle")}
    >
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-blue">{t("register.personal")}</p>
      <h1 className="text-[27px] text-navy">{t("register.eyebrow")}</h1>
      <p className="mt-1.5 text-[14.5px] text-muted">
        {t("register.existing")} {" "}
        <Link href="/login" className="font-semibold text-blue hover:text-blue-2">
          {t("register.login")}
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-7 grid gap-4.5" noValidate>
        {error && (
          <div className="rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-[13.5px] font-semibold text-ink">
              {t("register.firstName")}
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
              {t("register.lastName")}
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
            {t("common.email")}
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
            {t("common.phone")} <span className="font-normal text-muted">({t("common.optional")})</span>
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
            {t("common.password")}
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
            placeholder={t("register.passwordHint")}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 inline-flex items-center justify-center rounded-[11px] bg-blue px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_22px_rgba(36,86,184,.28)] transition-colors hover:bg-blue-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t("register.loading") : t("register.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
