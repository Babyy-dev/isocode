"use client";

import { useState } from "react";
import { LANGUAGE_COOKIE, type Language } from "@/lib/i18n/language";
import { layoutCopy } from "./copy";

/**
 * Switches language with a full reload so every section, the nav and the <html lang>
 * attribute change together. A soft `router.refresh()` left parts stale on mobile and
 * the router cache could serve a prefetched page in the previous language; a reload
 * re-requests the whole page with the new cookie and clears that cache.
 */
export function LanguageToggle({ language, className = "" }: { language: Language; className?: string }) {
  const [busy, setBusy] = useState(false);
  const next: Language = language === "en" ? "hi" : "en";
  const copy = layoutCopy[language];

  function switchLanguage() {
    if (busy) return;
    setBusy(true);
    document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; samesite=lax`;
    // Keep any ?lang= in the address in step, otherwise the proxy would restore the old
    // language from it on reload and override the cookie we just set.
    const url = new URL(window.location.href);
    if (url.searchParams.has("lang")) url.searchParams.set("lang", next);
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      disabled={busy}
      aria-busy={busy}
      aria-label={copy.switchLabel}
      lang={busy ? language : next}
      className={`min-h-11 rounded-xl border border-line px-3 py-2 text-sm transition-colors hover:border-accent disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {busy ? copy.switching : copy.switchTo}
    </button>
  );
}
