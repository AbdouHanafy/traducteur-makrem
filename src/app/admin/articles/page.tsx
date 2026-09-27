import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { listAllArticles } from "@/repositories/articles";
import AdminArticlesListPage from "@/views/AdminArticlesListPage";

export const metadata = buildMetadata({ title: "Articles (admin)", path: "/admin/articles", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");

  const articles = await listAllArticles();

  return (
    <AdminArticlesListPage
      articles={articles.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        coverImageUrl: a.coverImageUrl,
        published: a.published,
      }))}
    />
  );
}
