import { Inter, Spectral } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { buildMetadata, SITE } from "@/lib/seo";
import { DEFAULT_LOCALE, getTextDirection, isLocale } from "@/lib/i18n";
import I18nProvider from "@/views/components/I18nProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = buildMetadata({ title: SITE.name });

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const requestedLocale = (await headers()).get("x-site-locale");
  const locale = isLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  return (
    <html
      lang={locale}
      dir={getTextDirection(locale)}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spectral.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><I18nProvider locale={locale}>{children}</I18nProvider></body>
    </html>
  );
}
