import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { listAllPartners } from "@/repositories/partners";
import AdminPartnersPage from "@/views/AdminPartnersPage";

export const metadata = buildMetadata({ title: "Partenaires (admin)", path: "/admin/partners", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");
  const partners = await listAllPartners();
  return <AdminPartnersPage partners={partners.map((partner) => ({ ...partner, logoUrl: partner.logoUrl ?? "", websiteUrl: partner.websiteUrl ?? "" }))} />;
}
