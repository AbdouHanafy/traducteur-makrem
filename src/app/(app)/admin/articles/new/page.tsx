import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import AdminArticleFormPage from "@/views/AdminArticleFormPage";

export const metadata = buildMetadata({ title: "Nouvel article", path: "/admin/articles/new", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");

  return (
    <AdminArticleFormPage
      initial={{ slug: "", title: "", excerpt: "", body: "", coverImageUrl: "", published: false, translations: {} }}
    />
  );
}
