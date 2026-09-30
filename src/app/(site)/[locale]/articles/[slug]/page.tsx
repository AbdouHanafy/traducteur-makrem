import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { localize, TRANSLATABLE_FIELDS } from "@/lib/localize";
import { buildMetadata } from "@/lib/seo";
import { findPublishedArticleBySlug } from "@/repositories/articles";
import ArticleDetailPage from "@/views/ArticleDetailPage";

export async function generateMetadata({ params }: PageProps<"/[locale]/articles/[slug]">) {
  const { locale, slug } = await params;
  const found = await findPublishedArticleBySlug(slug);
  const article = found && isLocale(locale) ? localize(found, locale, TRANSLATABLE_FIELDS.article) : found;

  return buildMetadata({
    title: article?.title ?? "Article",
    description: article?.excerpt,
    path: `/articles/${slug}`,
  });
}

export default async function Page({ params }: PageProps<"/[locale]/articles/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const found = await findPublishedArticleBySlug(slug);
  if (!found) notFound();
  const article = localize(found, locale, TRANSLATABLE_FIELDS.article);

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
