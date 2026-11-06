export type Language = "en" | "hi";

export const LANGUAGE_COOKIE = "lang";
export const DEFAULT_LANGUAGE: Language = "en";

export function parseLanguage(value: unknown): Language | null {
  return value === "en" || value === "hi" ? value : null;
}
