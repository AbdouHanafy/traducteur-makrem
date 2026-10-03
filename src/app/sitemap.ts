import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { languageAlternates, localizedUrl } from "@/lib/seo";
import { listPublishedArticles } from "@/repositories/articles";

export const dynamic = "force-dynamic";

const STATIC_PATHS = ["/", "/services", "/a-propos", "/faq", "/contact", "/articles", "/conditions-generales", "/confidentialite", "/mentions-legales"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listPublishedArticles();
  return [
    ...STATIC_PATHS.flatMap((path) =>
      LOCALES.map((locale) => ({
        url: localizedUrl(locale, path),
        alternates: { languages: languageAlternates(path) },
        changeFrequency: path === "/" ? "weekly" as const : "monthly" as const,
        priority: path === "/" ? 1 : 0.8,
      })),
    ),
    ...articles.flatMap((article) => {
      const path = `/articles/${article.slug}`;
      return LOCALES.map((locale) => ({
        url: localizedUrl(locale, path),
        alternates: { languages: languageAlternates(path) },
        lastModified: article.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }),
  ];
}
