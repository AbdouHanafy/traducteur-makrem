import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { findPublishedArticleBySlug } from "@/repositories/articles";
import ArticleDetailPage from "@/views/ArticleDetailPage";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await findPublishedArticleBySlug(slug);

  return buildMetadata({
    title: article?.title ?? "Article",
    description: article?.excerpt,
    path: `/articles/${slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await findPublishedArticleBySlug(slug);
  if (!article) notFound();

  return (
    <ArticleDetailPage
      article={{
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        coverImageUrl: article.coverImageUrl,
        publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
      }}
    />
  );
}
