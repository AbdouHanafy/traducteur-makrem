import Link from "next/link";

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

export default function AdminUsersListPage({ users }: { users: UserRow[] }) {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] text-navy">Utilisateurs</h1>
          <p className="mt-1 text-[13.5px] text-muted">{users.length} compte{users.length > 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 rounded-[11px] bg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-2"
        >
          Nouvel utilisateur
        </Link>
      </div>

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
              <th className="px-5 py-3" />
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
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${ROLE_BADGE_CLASS[user.role]}`}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/admin/users/${user.id}`} className="font-semibold text-blue hover:text-blue-2">
                    Modifier
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
            className="block rounded-[14px] border border-line bg-white p-4"
          >
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
              <span className="text-[13.5px] font-semibold text-blue">Modifier</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
