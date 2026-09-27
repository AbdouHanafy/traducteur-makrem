import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/rbac";
import { buildMetadata } from "@/lib/seo";
import AdminUserFormPage from "@/views/AdminUserFormPage";

export const metadata = buildMetadata({ title: "Nouvel utilisateur", path: "/admin/users/new", noIndex: true });

export default async function Page() {
  const result = await requireAdminSession();
  if ("error" in result) redirect("/admin/orders");

  return (
    <AdminUserFormPage
      initial={{ firstName: "", lastName: "", email: "", phone: "", role: "CLIENT" }}
      isSelf={false}
    />
  );
}
