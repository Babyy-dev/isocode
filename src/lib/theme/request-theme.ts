import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_THEME, THEME_COOKIE, parseTheme, type Theme } from "./theme";

/** Read on the server so the first HTML already carries the theme (no light flash in dark mode). */
export async function requestTheme(): Promise<Theme> {
  const store = await cookies();
  return parseTheme(store.get(THEME_COOKIE)?.value) ?? DEFAULT_THEME;
}
