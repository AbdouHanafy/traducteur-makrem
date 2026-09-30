import { redirect, notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/rbac";
import { buildMetadata } from "@/lib/seo";
import { findUserById } from "@/repositories/users";
import AdminUserFormPage from "@/views/AdminUserFormPage";

export const metadata = buildMetadata({ title: "Modifier l'utilisateur", path: "/admin/users", noIndex: true });

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireAdminSession();
  if ("error" in result) redirect("/admin/orders");

  const user = await findUserById(id);
  if (!user) notFound();

  return (
    <AdminUserFormPage
      initial={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role,
        orderCount: user._count.orders,
      }}
      isSelf={user.id === result.session.user.id}
    />
  );
}
