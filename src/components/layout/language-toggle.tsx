"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LANGUAGE_COOKIE, type Language } from "@/lib/i18n/language";
import { layoutCopy } from "./copy";

/**
 * Switches language in place: saves the cookie, keeps any `?lang=` (from a search-engine link) in step,
 * then refreshes every server component, layouts included, so nav and content change together.
 */
export function LanguageToggle({ language, className = "" }: { language: Language; className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next: Language = language === "en" ? "hi" : "en";
  const copy = layoutCopy[language];

  function switchLanguage() {
    document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; samesite=lax`;
    const url = new URL(window.location.href);
    startTransition(() => {
      // An old ?lang= in the address would make the proxy restore the old language, so update it
      // through the router first; the refresh that follows then re-renders layouts too.
      if (url.searchParams.has("lang")) {
        url.searchParams.set("lang", next);
        router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      disabled={pending}
      aria-busy={pending}
      aria-label={copy.switchLabel}
      lang={pending ? language : next}
      className={`min-h-11 rounded-xl border border-line px-3 py-2 text-sm transition-colors hover:border-accent disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {pending ? copy.switching : copy.switchTo}
    </button>
  );
}
