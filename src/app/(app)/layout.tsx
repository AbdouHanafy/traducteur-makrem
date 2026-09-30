import { headers } from "next/headers";
import "../globals.css";
import { inter, spectral } from "@/app/fonts";
import { buildMetadata, SITE } from "@/lib/seo";
import { DEFAULT_LOCALE, getTextDirection, isLocale } from "@/lib/i18n";
import { themeToCssVars } from "@/lib/theme";
import { getSiteContentOverrides } from "@/repositories/siteContent";
import { getThemeOverrides } from "@/repositories/siteSettings";
import I18nProvider from "@/views/components/I18nProvider";

export const metadata = buildMetadata({ title: SITE.name });

/** Espaces connectés (client, admin, paiement) : rendus à la demande, langue lue depuis le cookie. */
export default async function AppRootLayout({ children }: { children: React.ReactNode }) {
  const requestedLocale = (await headers()).get("x-site-locale");
  const locale = isLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
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
