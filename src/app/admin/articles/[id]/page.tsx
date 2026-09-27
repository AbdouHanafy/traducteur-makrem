import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { findArticleById } from "@/repositories/articles";
import AdminArticleFormPage from "@/views/AdminArticleFormPage";

export const metadata = buildMetadata({ title: "Modifier l'article", path: "/admin/articles", noIndex: true });

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");

  const article = await findArticleById(id);
  if (!article) notFound();

  return (
    <AdminArticleFormPage
      initial={{
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        coverImageUrl: article.coverImageUrl ?? "",
        published: article.published,
      }}
    />
  );
}
