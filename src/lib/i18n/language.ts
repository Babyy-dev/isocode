export type Language = "en" | "hi";

/** A session cookie: the choice lasts for the visit, and every new visit starts in English. */
export const LANGUAGE_COOKIE = "lang";
export const DEFAULT_LANGUAGE: Language = "en";

export function parseLanguage(value: unknown): Language | null {
  return value === "en" || value === "hi" ? value : null;
}
