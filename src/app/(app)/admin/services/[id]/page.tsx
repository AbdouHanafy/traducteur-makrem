import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { readTranslationsMap } from "@/lib/localize";
import { findServiceById } from "@/repositories/services";
import AdminServiceFormPage from "@/views/AdminServiceFormPage";

export const metadata = buildMetadata({ title: "Modifier le service", path: "/admin/services", noIndex: true });

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");

  const service = await findServiceById(id);
  if (!service) notFound();

  return (
    <AdminServiceFormPage
      initial={{
        id: service.id,
        slug: service.slug,
        name: service.name,
        description: service.description,
        pricePerPage: service.pricePerPage.toString(),
        imageUrl: service.imageUrl ?? "",
        active: service.active,
        translations: readTranslationsMap(service.translations),
      }}
    />
  );
}
