import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

/**
 * Deux rôles (ARCHITECTURE.md §7) :
 *
 * 1. Garde "optimiste" : on constate seulement la présence du cookie de session pour
 *    /admin et /dashboard. La vraie vérification (session + rôle) se fait côté serveur
 *    dans les layouts via `auth.api.getSession`.
 * 2. Langue : choisie depuis le cookie puis Accept-Language. Les pages publiques vivent sous
 *    `app/(site)/[locale]` et sont réécrites en interne (`/services` → `/fr/services`) : l'URL
 *    visible ne change pas, mais chaque page devient statique/cachable par langue au lieu d'être
 *    rendue à chaque requête. Les espaces connectés reçoivent la langue via l'en-tête
 *    `x-site-locale`.
 *
 * Fichier nommé `proxy.ts` (pas `middleware.ts`) : cette version de Next.js a renommé la
 * convention — voir node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 */
const PROTECTED_PREFIXES = ["/admin", "/dashboard"];
const DYNAMIC_PREFIXES = ["/paiement"];

function startsWithSegment(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function detectLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  const browserLanguage = request.headers.get("accept-language")?.split(",")[0]?.split("-")[0]?.toLowerCase();
  return isLocale(browserLanguage) ? browserLanguage : DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => startsWithSegment(pathname, prefix));

  if (isProtected && !getSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const locale = detectLocale(request);
  const hasLocaleCookie = isLocale(request.cookies.get(LOCALE_COOKIE)?.value);

  let response: NextResponse;
  if (isProtected || DYNAMIC_PREFIXES.some((prefix) => startsWithSegment(pathname, prefix))) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-site-locale", locale);
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    const firstSegment = pathname.split("/")[1];
    // Un chemin déjà préfixé par une langue (/fr/services) est servi tel quel.
    if (isLocale(firstSegment)) {
      response = NextResponse.next();
    } else {
      const target = request.nextUrl.clone();
      target.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
      response = NextResponse.rewrite(target);
    }
  }

  if (!hasLocaleCookie) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|twitter-image|icon|apple-icon|brand|uploads).*)"],
};
