import { notFound } from "next/navigation";
import "../../globals.css";
import { inter, spectral } from "@/app/fonts";
import { buildMetadata, SITE } from "@/lib/seo";
import { getTextDirection, isLocale, LOCALES } from "@/lib/i18n";
import { themeToCssVars } from "@/lib/theme";
import { getSiteContentOverrides } from "@/repositories/siteContent";
import { getThemeOverrides } from "@/repositories/siteSettings";
import I18nProvider from "@/views/components/I18nProvider";

export const metadata = buildMetadata({ title: SITE.name });

/** Pages générées à la demande puis mises en cache : le build ne dépend pas de la base. */
export function generateStaticParams() {
  return [];
}
export const revalidate = 3600;

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale) || !LOCALES.includes(locale)) notFound();

  const [contentOverrides, themeOverrides] = await Promise.all([getSiteContentOverrides(locale), getThemeOverrides()]);
  return (
    <html
      lang={locale}
      dir={getTextDirection(locale)}
      data-scroll-behavior="smooth"
      style={themeToCssVars(themeOverrides) as React.CSSProperties}
      className={`${inter.variable} ${spectral.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><I18nProvider locale={locale} overrides={contentOverrides}>{children}</I18nProvider></body>
    </html>
  );
}
