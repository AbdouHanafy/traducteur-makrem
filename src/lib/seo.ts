import type { Metadata } from "next";

/**
 * Configuration SEO centralisée — même pattern que calmatrip : on construit chaque
 * page.tsx metadata avec buildMetadata() plutôt que de dupliquer title/OG partout.
 */
export const SITE = {
  name: "Maître Makram Arfaoui",
  shortName: "M. Arfaoui — Traducteur assermenté",
  // TODO: confirmer le domaine définitif avant la Phase 13 (SEO/déploiement).
  url: "https://www.makramarfaoui.com",
  locale: "fr_TN",
  description:
    "Traducteur et interprète assermenté à Tunis. Traductions juridiques certifiées commandées et suivies en ligne : actes d'état civil, diplômes, contrats, documents judiciaires.",
};

interface BuildMetadataInput {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description = SITE.description,
  path = "/",
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = new URL(path, SITE.url).toString();

  return {
    title: title === SITE.name ? title : `${title} · ${SITE.name}`,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: "website",
    },
  };
}
