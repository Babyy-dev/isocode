import { NextResponse, type NextRequest } from "next/server";
import { LANGUAGE_COOKIE, parseLanguage } from "@/lib/i18n/language";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Remembers the language chosen with `?lang=en|hi`. The cookie is written to the
 * incoming request too, so the page rendered for this same request already sees it.
 */
export function proxy(request: NextRequest) {
  const chosen = parseLanguage(request.nextUrl.searchParams.get("lang"));
  if (!chosen || request.cookies.get(LANGUAGE_COOKIE)?.value === chosen)
    return NextResponse.next();
  request.cookies.set(LANGUAGE_COOKIE, chosen);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(LANGUAGE_COOKIE, chosen, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  // Pages only: skip API routes, Next internals and any static file (a path with an extension).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
