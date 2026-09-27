import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Vérification "optimiste" (ARCHITECTURE.md §7) : on ne fait que constater la présence du
 * cookie de session ici, pas d'appel Prisma. La vérification réelle de la session (et la
 * relecture du rôle) a lieu côté serveur dans /dashboard via `auth.api.getSession`.
 *
 * Fichier nommé `proxy.ts` (pas `middleware.ts`) : cette version de Next.js a renommé la
 * convention — voir node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
