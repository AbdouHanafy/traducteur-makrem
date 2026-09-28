import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

/**
 * Vérification "optimiste" (ARCHITECTURE.md §7) : on ne fait que constater la présence du
 * cookie de session ici, pas d'appel Prisma. La vérification réelle de la session (et la
 * relecture du rôle) a lieu côté serveur dans /dashboard via `auth.api.getSession`.
 *
 * Fichier nommé `proxy.ts` (pas `middleware.ts`) : cette version de Next.js a renommé la
 * convention — voir node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedArea = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const sessionCookie = protectedArea ? getSessionCookie(request) : null;

  if (protectedArea && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const browserLanguage = request.headers.get("accept-language")?.split(",")[0]?.split("-")[0];
  const locale: Locale = protectedArea
    ? DEFAULT_LOCALE
    : isLocale(cookieLocale)
      ? cookieLocale
      : isLocale(browserLanguage)
        ? browserLanguage
        : DEFAULT_LOCALE;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-locale", locale);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (!protectedArea && !isLocale(cookieLocale)) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|brand|uploads).*)"],
};
