import type { Language } from "@/lib/i18n/language";
import { authCopy } from "./copy";

export function authErrorMessage(
  status: number | undefined,
  signUp: boolean,
  language: Language = "en",
): string {
  const errors = authCopy[language].errors;
  if (status === 429) return errors.tooMany;
  if (status === 503) return errors.unavailable;
  return signUp ? errors.signUp : errors.signIn;
}
