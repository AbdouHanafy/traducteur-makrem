import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { getSiteContentAdminData } from "@/lib/site-content";
import { getAllSiteContentOverrides } from "@/repositories/siteContent";
import AdminSiteContentPage from "@/views/AdminSiteContentPage";

export const metadata = buildMetadata({ title: "Contenu du site (admin)", path: "/admin/site-content", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");

  const [{ groups, defaults }, overrides] = await Promise.all([
    Promise.resolve(getSiteContentAdminData()),
    getAllSiteContentOverrides(),
  ]);

  return <AdminSiteContentPage groups={groups} defaults={defaults} overrides={overrides} />;
}
