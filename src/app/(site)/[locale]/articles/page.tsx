import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { notFound } from "next/navigation";
import { localize, TRANSLATABLE_FIELDS } from "@/lib/localize";
import { listPublishedArticles } from "@/repositories/articles";
import ArticlesListPage from "@/views/ArticlesListPage";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(isLocale(locale) ? locale : "fr", "articles", "/articles");
}

export default async function Page({ params }: PageProps<"/[locale]/articles">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const articles = (await listPublishedArticles()).map((article) => localize(article, locale, TRANSLATABLE_FIELDS.article));

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
