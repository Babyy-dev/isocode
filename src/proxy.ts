import { NextResponse, type NextRequest } from "next/server";
import { LANGUAGE_COOKIE, parseLanguage } from "@/lib/i18n/language";

/**
 * Remembers the language chosen with `?lang=en|hi`. The cookie is written to the
 * incoming request too, so the page rendered for this same request already sees it.
 */
export function proxy(request: NextRequest) {
  // Background prefetches are not a visitor's choice; only real navigations may set the language.
  if (isPrefetch(request)) return NextResponse.next();
  const chosen = parseLanguage(request.nextUrl.searchParams.get("lang"));
  if (!chosen || request.cookies.get(LANGUAGE_COOKIE)?.value === chosen)
    return NextResponse.next();
  request.cookies.set(LANGUAGE_COOKIE, chosen);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(LANGUAGE_COOKIE, chosen, {
    path: "/",
    sameSite: "lax",
  });
  return response;
}

function isPrefetch(request: NextRequest) {
  return (
    request.headers.has("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose")?.includes("prefetch") === true
  );
}

export const config = {
  // Pages only: skip API routes, Next internals and any static file (a path with an extension).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
