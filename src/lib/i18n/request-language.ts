import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE, parseLanguage, type Language } from "./language";

/**
 * The visitor's language for this request. `src/proxy.ts` copies any `?lang=`
 * into the cookie first, so the cookie is the single source of truth here.
 */
export async function requestLanguage(): Promise<Language> {
  const store = await cookies();
  return parseLanguage(store.get(LANGUAGE_COOKIE)?.value) ?? DEFAULT_LANGUAGE;
}
