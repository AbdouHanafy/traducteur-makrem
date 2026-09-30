import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import AdminServiceFormPage from "@/views/AdminServiceFormPage";

export const metadata = buildMetadata({ title: "Nouveau service", path: "/admin/services/new", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");

  return (
    <AdminServiceFormPage
      initial={{ slug: "", name: "", description: "", pricePerPage: "0.000", imageUrl: "", active: true, translations: {} }}
    />
  );
}
