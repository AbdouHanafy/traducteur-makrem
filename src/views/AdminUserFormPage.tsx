"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/views/components/I18nProvider";

type Role = "CLIENT" | "ADMIN";

export interface UserFormValues {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  orderCount?: number;
}

export default function AdminUserFormPage({
  initial,
  isSelf,
}: {
  initial: UserFormValues;
  isSelf: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const roleLabel = (role: Role) => t(role === "ADMIN" ? "adm.users.roleAdmin" : "adm.users.roleClient");
  const isEdit = Boolean(initial.id);
  const [form, setForm] = useState({ ...initial, password: "" });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isEdit ? `/api/admin/users/${initial.id}` : "/api/admin/users";
    const body = isEdit
      ? { firstName: form.firstName, lastName: form.lastName, phone: form.phone, role: form.role }
      : { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, role: form.role, password: form.password };

    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || t("adm.errorGeneric"));
      return;
    }

    router.push("/admin/users");
    router.refresh();
  }

  async function onDelete() {
    if (!initial.id) return;
    if (!confirm(t("adm.userForm.deleteConfirm", { name: `${initial.firstName} ${initial.lastName}` }))) return;

    setDeleting(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${initial.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || t("adm.userForm.deleteErr"));
      return;
    }

    router.push("/admin/users");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 py-14">
      <h1 className="mb-8 text-[26px] text-navy">{isEdit ? t("adm.userForm.titleEdit") : t("adm.userForm.titleNew")}</h1>

      <form onSubmit={onSubmit} className="grid gap-5 rounded-2xl border border-line bg-white p-7">
        {error && (
          <div className="rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[13.5px] text-danger">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.firstName")}</label>
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.lastName")}</label>
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.email")}</label>
          {isEdit ? (
            <>
              <input
                disabled
                value={form.email}
                className="w-full rounded-xl border border-line bg-mist px-4 py-3 text-[15px] text-muted"
              />
              <p className="mt-1.5 text-[12.5px] text-muted">
                {t("adm.userForm.emailLocked")}
              </p>
            </>
          ) : (
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.phone")}</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
          />
        </div>

        {!isEdit && (
          <div>
            <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.userForm.tempPassword")}</label>
            <input
              required
              type="password"
              minLength={10}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder={t("adm.userForm.passwordHint")}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue"
            />
            <p className="mt-1.5 text-[12.5px] text-muted">
              {t("adm.userForm.passwordNote")}
            </p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t("adm.userForm.role")}</label>
          <select
            disabled={isSelf}
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            {(["CLIENT", "ADMIN"] as Role[]).map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>
          {isSelf && (
            <p className="mt-1.5 text-[12.5px] text-muted">{t("adm.userForm.selfRole")}</p>
          )}
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-fit items-center justify-center rounded-xl bg-blue px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-2 disabled:opacity-60"
          >
            {loading ? t("adm.saving") : t("adm.save")}
          </button>

          {isEdit && !isSelf && (
            <button
              type="button"
              disabled={deleting || (initial.orderCount ?? 0) > 0}
              onClick={onDelete}
              title={(initial.orderCount ?? 0) > 0 ? t("adm.userForm.hasOrders") : undefined}
              className="text-[13.5px] font-semibold text-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting ? t("adm.userForm.deleting") : t("adm.userForm.deleteBtn")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
