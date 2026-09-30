import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/rbac";
import { buildMetadata } from "@/lib/seo";
import { listAllUsers } from "@/repositories/users";
import AdminUsersListPage from "@/views/AdminUsersListPage";

export const metadata = buildMetadata({ title: "Utilisateurs (admin)", path: "/admin/users", noIndex: true });

export default async function Page() {
  const result = await requireAdminSession();
  if ("error" in result) redirect("/admin/orders");

  const users = await listAllUsers();

  return (
    <AdminUsersListPage
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        orderCount: u._count.orders,
      }))}
    />
  );
}
