import { notFound } from "next/navigation";
import "../../globals.css";
import { fontVariableClasses } from "@/app/fonts";
import { buildMetadata, SITE } from "@/lib/seo";
import { getTextDirection, isLocale, LOCALES } from "@/lib/i18n";
import { customFontFaceCss, themeToCssVars } from "@/lib/theme";
import { getSiteContentOverrides } from "@/repositories/siteContent";
import { getThemeSettings } from "@/repositories/siteSettings";
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

  const [contentOverrides, themeSettings] = await Promise.all([getSiteContentOverrides(locale), getThemeSettings()]);
  return (
    <html
      lang={locale}
      dir={getTextDirection(locale)}
      data-scroll-behavior="smooth"
      style={themeToCssVars(themeSettings) as React.CSSProperties}
      className={`${fontVariableClasses} h-full antialiased`}
    >
      <head>{themeSettings.customFonts.length > 0 && <style dangerouslySetInnerHTML={{ __html: customFontFaceCss(themeSettings.customFonts) }} />}</head>
      <body className="min-h-full flex flex-col"><I18nProvider locale={locale} overrides={contentOverrides}>{children}</I18nProvider></body>
    </html>
  );
}
