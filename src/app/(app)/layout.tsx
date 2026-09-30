import { headers } from "next/headers";
import "../globals.css";
import { fontVariableClasses } from "@/app/fonts";
import { buildMetadata, SITE } from "@/lib/seo";
import { DEFAULT_LOCALE, getTextDirection, isLocale } from "@/lib/i18n";
import { customFontFaceCss, themeToCssVars } from "@/lib/theme";
import { getSiteContentOverrides } from "@/repositories/siteContent";
import { getThemeSettings } from "@/repositories/siteSettings";
import I18nProvider from "@/views/components/I18nProvider";

export const metadata = buildMetadata({ title: SITE.name });

/** Espaces connectés (client, admin, paiement) : rendus à la demande, langue lue depuis le cookie. */
export default async function AppRootLayout({ children }: { children: React.ReactNode }) {
  const requestedLocale = (await headers()).get("x-site-locale");
  const locale = isLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
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
