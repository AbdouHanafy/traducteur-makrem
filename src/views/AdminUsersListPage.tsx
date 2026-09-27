"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "CLIENT" | "TRANSLATOR" | "ADMIN";

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  orderCount: number;
}

const ROLE_LABELS: Record<Role, string> = {
  CLIENT: "Client",
  TRANSLATOR: "Traducteur",
  ADMIN: "Admin",
};

const ROLE_BADGE_CLASS: Record<Role, string> = {
  CLIENT: "bg-mist text-muted",
  TRANSLATOR: "bg-blue-soft text-blue-2",
  ADMIN: "bg-ok-soft text-ok",
};

export default function AdminUsersListPage({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeRole(userId: string, role: Role) {
    setBusyId(userId);
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Impossible de modifier le rôle.");
      return;
    }
    router.refresh();
  }

  function RoleSelect({ user }: { user: UserRow }) {
    return (
      <select
        value={user.role}
        disabled={busyId === user.id || user.id === currentUserId}
        onChange={(e) => changeRole(user.id, e.target.value as Role)}
        className="rounded-[8px] border border-line bg-white px-2.5 py-1.5 text-[13px] font-medium text-ink outline-none focus:border-blue disabled:cursor-not-allowed disabled:opacity-60"
      >
        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14">
      <div className="mb-8">
        <h1 className="text-[26px] text-navy">Utilisateurs</h1>
        <p className="mt-1 text-[13.5px] text-muted">{users.length} compte{users.length > 1 ? "s" : ""}</p>
      </div>

      {error && (
        <div className="mb-5 rounded-[10px] border border-[#f3c6c6] bg-[#fdecec] px-4 py-3 text-[13.5px] text-[#9c2c2c]">
          {error}
        </div>
      )}

      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-[14px] border border-line bg-white md:block">
        <table className="w-full text-left text-[13.5px]">
          <thead className="bg-mist text-[12px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3">Utilisateur</th>
              <th className="px-5 py-3">Téléphone</th>
              <th className="px-5 py-3">Commandes</th>
              <th className="px-5 py-3">Inscrit le</th>
              <th className="px-5 py-3">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-line">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-ink">{user.name}</div>
                  <div className="text-[12px] text-muted">{user.email}</div>
                </td>
                <td className="px-5 py-3.5 text-ink">{user.phone || "—"}</td>
                <td className="px-5 py-3.5 text-ink">{user.orderCount}</td>
                <td className="px-5 py-3.5 text-muted">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${ROLE_BADGE_CLASS[user.role]}`}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                    <RoleSelect user={user} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile : cartes */}
      <div className="grid gap-3 md:hidden">
        {users.map((user) => (
          <div key={user.id} className="rounded-[14px] border border-line bg-white p-4">
            <div className="min-w-0">
              <div className="truncate font-semibold text-ink">{user.name}</div>
              <div className="truncate text-[12px] text-muted">{user.email}</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-[13px] text-muted">
              <span>Téléphone</span>
              <span className="text-right text-ink">{user.phone || "—"}</span>
              <span>Commandes</span>
              <span className="text-right text-ink">{user.orderCount}</span>
              <span>Inscrit le</span>
              <span className="text-right text-ink">{new Date(user.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${ROLE_BADGE_CLASS[user.role]}`}
              >
                {ROLE_LABELS[user.role]}
              </span>
              <RoleSelect user={user} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
