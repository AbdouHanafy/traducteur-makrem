import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/lib/i18n";

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
  email: "contact@makramarfaoui.com",
  phones: ["+21622200170", "+21651100036"],
  address: {
    streetAddress: "17 Rue de Marseille",
    addressLocality: "Tunis",
    postalCode: "1001",
    addressCountry: "TN",
  },
};

const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  fr: "fr_TN",
  ar: "ar_TN",
  en: "en_GB",
  it: "it_IT",
};

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}

export function localizedPath(locale: Locale, path = "/"): string {
  const normalizedPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalizedPath}`;
}

export function localizedUrl(locale: Locale, path = "/"): string {
  return absoluteUrl(localizedPath(locale, path));
}

export function languageAlternates(path = "/"): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, localizedUrl(locale, path)])),
    // Existing unprefixed routes remain the locale-negotiating entry points.
    "x-default": absoluteUrl(path),
  };
}

interface BuildMetadataInput {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  locale?: Locale;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

export function buildMetadata({
  title,
  description = SITE.description,
  path = "/",
  noIndex = false,
  locale,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
}: BuildMetadataInput): Metadata {
  const url = locale ? localizedUrl(locale, path) : absoluteUrl(path);
  const socialImage = image ? absoluteUrl(image) : absoluteUrl("/opengraph-image");
  const openGraphLocale = locale ? OPEN_GRAPH_LOCALES[locale] : SITE.locale;

  return {
    metadataBase: new URL(SITE.url),
    title: title === SITE.name ? title : `${title} · ${SITE.name}`,
    description,
    alternates: {
      canonical: url,
      ...(locale ? { languages: languageAlternates(path) } : {}),
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: openGraphLocale,
      alternateLocale: locale
        ? LOCALES.filter((candidate) => candidate !== locale).map((candidate) => OPEN_GRAPH_LOCALES[candidate])
        : undefined,
      type,
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${title} — ${SITE.name}` }],
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export function professionalServiceJsonLd(locale: Locale, description = SITE.description) {
  return {
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": `${SITE.url}/#professional-service`,
    name: SITE.name,
    url: localizedUrl(locale),
    description,
    image: absoluteUrl("/opengraph-image"),
    logo: absoluteUrl("/brand/makram-arfaoui-logo.png"),
    email: SITE.email,
    telephone: SITE.phones,
    address: { "@type": "PostalAddress", ...SITE.address },
    currenciesAccepted: "TND",
    availableLanguage: ["French", "Arabic", "English"],
  };
}

export function websiteJsonLd(locale: Locale) {
  return {
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: localizedUrl(locale),
    inLanguage: locale,
    publisher: { "@id": `${SITE.url}/#professional-service` },
  };
}

export function breadcrumbJsonLd(
  locale: Locale,
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: localizedUrl(locale, item.path),
    })),
  };
}
