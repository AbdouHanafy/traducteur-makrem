import type { Metadata } from "next";
import { translate, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

type PageKey = "services" | "faq" | "articles" | "contact" | "about" | "register" | "login" | "order";

/** Titre/description SEO d'une page publique dans la langue demandée (clés `seo.<page>.*`). */
export function pageMetadata(locale: Locale, page: PageKey, path: string, noIndex = false): Metadata {
  const descriptionKey = `seo.${page}.description`;
  const title = translate(locale, page === "order" ? "seo.order.title" : `seo.${page}.title`);
  const description = translate(locale, descriptionKey);
  return buildMetadata({
    title,
    description: description === descriptionKey ? undefined : description,
    path,
    noIndex,
  });
}
