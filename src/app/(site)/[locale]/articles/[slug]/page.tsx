import { notFound } from "next/navigation";
import { isLocale, translate } from "@/lib/i18n";
import { localize, TRANSLATABLE_FIELDS } from "@/lib/localize";
import { breadcrumbJsonLd, buildMetadata, localizedUrl, SITE } from "@/lib/seo";
import { findPublishedArticleBySlug } from "@/repositories/articles";
import ArticleDetailPage from "@/views/ArticleDetailPage";
import JsonLd from "@/views/components/JsonLd";

export async function generateMetadata({ params }: PageProps<"/[locale]/articles/[slug]">) {
  const { locale, slug } = await params;
  const found = await findPublishedArticleBySlug(slug);
  const article = found && isLocale(locale) ? localize(found, locale, TRANSLATABLE_FIELDS.article) : found;

  return buildMetadata({
    title: article?.title ?? "Article",
    description: article?.excerpt,
    path: `/articles/${slug}`,
    locale: isLocale(locale) ? locale : "fr",
    image: article?.coverImageUrl,
    type: "article",
    publishedTime: article?.publishedAt?.toISOString(),
    modifiedTime: article?.updatedAt.toISOString(),
  });
}

export default async function Page({ params }: PageProps<"/[locale]/articles/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const found = await findPublishedArticleBySlug(slug);
  if (!found) notFound();
  const article = localize(found, locale, TRANSLATABLE_FIELDS.article);
  const path = `/articles/${slug}`;
  const articleJsonLd = {
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    mainEntityOfPage: localizedUrl(locale, path),
    inLanguage: locale,
    datePublished: article.publishedAt?.toISOString() ?? article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    ...(article.coverImageUrl ? { image: [new URL(article.coverImageUrl, SITE.url).toString()] } : {}),
    author: { "@type": "Person", name: SITE.name },
    publisher: {
      "@type": "ProfessionalService",
      "@id": `${SITE.url}/#professional-service`,
      name: SITE.name,
      logo: { "@type": "ImageObject", url: new URL("/brand/makram-arfaoui-logo.png", SITE.url).toString() },
    },
  };

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd,
          breadcrumbJsonLd(locale, [
            { name: translate(locale, "nav.home"), path: "/" },
            { name: translate(locale, "nav.articles"), path: "/articles" },
            { name: article.title, path },
          ]),
        ]}
      />
      <ArticleDetailPage
        article={{
          title: article.title,
          excerpt: article.excerpt,
          body: article.body,
          coverImageUrl: article.coverImageUrl,
          publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
        }}
      />
    </>
  );
}
