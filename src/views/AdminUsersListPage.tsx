"use client";

import Link from "next/link";
import { getDateLocale } from "@/lib/i18n";
import { useI18n } from "@/views/components/I18nProvider";

type Role = "CLIENT" | "ADMIN";

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  orderCount: number;
}

const ROLE_BADGE_CLASS: Record<Role, string> = {
  CLIENT: "bg-mist text-muted",
  ADMIN: "bg-ok-soft text-ok",
};

export default function AdminUsersListPage({ users }: { users: UserRow[] }) {
  const { t, locale } = useI18n();
  const dateLocale = getDateLocale(locale);
  const roleLabel = (role: Role) => t(role === "ADMIN" ? "adm.users.roleAdmin" : "adm.users.roleClient");
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue">{t("adm.users.eyebrow")}</p>
          <h1 className="text-[27px] text-navy sm:text-[30px]">{t("adm.users.title")}</h1>
          <p className="mt-2 text-[13.5px] text-muted">{t(users.length > 1 ? "adm.users.subMany" : "adm.users.subOne", { count: users.length })}</p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-[13.5px] font-semibold text-white shadow-[0_8px_22px_rgba(20,40,77,0.18)] transition hover:bg-navy-2"
        >
          {t("adm.users.new")}
        </Link>
      </div>

      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#e4e9f1] bg-white shadow-[0_8px_25px_rgba(20,40,77,0.04)] md:block">
        <table className="w-full text-left text-[13.5px]">
          <thead className="bg-[#f8f9fc] text-[10.5px] uppercase tracking-[0.1em] text-muted">
            <tr>
              <th className="px-5 py-3">{t("adm.users.colUser")}</th>
              <th className="px-5 py-3">{t("adm.phone")}</th>
              <th className="px-5 py-3">{t("adm.users.colOrders")}</th>
              <th className="px-5 py-3">{t("adm.users.colJoined")}</th>
              <th className="px-5 py-3">{t("adm.users.colRole")}</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-mist transition hover:bg-[#f8faff]">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-ink">{user.name}</div>
                  <div className="text-[12px] text-muted">{user.email}</div>
                </td>
                <td className="px-5 py-3.5 text-ink">{user.phone || "—"}</td>
                <td className="px-5 py-3.5 text-ink">{user.orderCount}</td>
                <td className="px-5 py-3.5 text-muted">
                  {new Date(user.createdAt).toLocaleDateString(dateLocale)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${ROLE_BADGE_CLASS[user.role]}`}
                  >
                    {roleLabel(user.role)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/admin/users/${user.id}`} className="font-semibold text-blue hover:text-blue-2">
                    {t("adm.edit")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile : cartes */}
      <div className="grid gap-3 md:hidden">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/admin/users/${user.id}`}
            className="block rounded-2xl border border-[#e4e9f1] bg-white p-4 shadow-[0_6px_20px_rgba(20,40,77,0.04)]"
          >
            <div className="min-w-0">
              <div className="truncate font-semibold text-ink">{user.name}</div>
              <div className="truncate text-[12px] text-muted">{user.email}</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-[13px] text-muted">
              <span>{t("adm.phone")}</span>
              <span className="text-right text-ink">{user.phone || "—"}</span>
              <span>{t("adm.users.colOrders")}</span>
              <span className="text-right text-ink">{user.orderCount}</span>
              <span>{t("adm.users.colJoined")}</span>
              <span className="text-right text-ink">{new Date(user.createdAt).toLocaleDateString(dateLocale)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${ROLE_BADGE_CLASS[user.role]}`}
              >
                {roleLabel(user.role)}
              </span>
              <span className="text-[13.5px] font-semibold text-blue">{t("adm.edit")}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
