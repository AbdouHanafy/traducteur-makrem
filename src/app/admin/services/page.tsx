import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { listAllServices } from "@/repositories/services";
import AdminServicesListPage from "@/views/AdminServicesListPage";

export const metadata = buildMetadata({ title: "Services (admin)", path: "/admin/services", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");

  const services = await listAllServices();

  return (
    <AdminServicesListPage
      services={services.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        pricePerPage: s.pricePerPage.toString(),
        imageUrl: s.imageUrl,
        active: s.active,
      }))}
    />
  );
}
