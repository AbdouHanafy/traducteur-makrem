import { buildMetadata } from "@/lib/seo";
import { listPublishedArticles } from "@/repositories/articles";
import ArticlesListPage from "@/views/ArticlesListPage";

export const metadata = buildMetadata({
  title: "Articles & actualités",
  description: "Actualités et articles du cabinet de Maître Makram Arfaoui, traducteur assermenté à Tunis.",
  path: "/articles",
});

export default async function Page() {
  const articles = await listPublishedArticles();

  return (
    <ArticlesListPage
      articles={articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        coverImageUrl: a.coverImageUrl,
      }))}
    />
  );
}
