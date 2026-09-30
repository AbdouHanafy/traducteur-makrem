import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { listPublishedArticles } from "@/repositories/articles";

export const dynamic = "force-dynamic";

const STATIC_PATHS = ["/", "/services", "/a-propos", "/faq", "/contact", "/articles", "/conditions-generales", "/confidentialite", "/mentions-legales"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listPublishedArticles();
  return [
    ...STATIC_PATHS.map((path) => ({ url: new URL(path, SITE.url).toString() })),
    ...articles.map((article) => ({
      url: new URL(`/articles/${article.slug}`, SITE.url).toString(),
      lastModified: article.updatedAt,
    })),
  ];
}
