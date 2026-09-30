import { NextResponse } from "next/server";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n";
import { limit, MINUTE } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const blocked = limit(request, "locale", { perIp: [60, MINUTE] });
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  if (!body || !isLocale(body.locale)) {
    return NextResponse.json({ error: "Unsupported locale." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, locale: body.locale });
  response.cookies.set(LOCALE_COOKIE, body.locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });
  return response;
}
