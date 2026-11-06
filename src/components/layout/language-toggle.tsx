"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Language } from "@/lib/i18n/language";
import { layoutCopy } from "./copy";

/** Reloads the current page in the other language; `src/proxy.ts` remembers the choice. */
export function LanguageToggle({ language }: { language: Language }) {
  const pathname = usePathname();
  const params = new URLSearchParams(useSearchParams());
  const next: Language = language === "en" ? "hi" : "en";
  params.set("lang", next);
  const copy = layoutCopy[language];
  return (
    <Link
      className="rounded border border-line px-3 py-2 text-sm hover:border-accent"
      href={`${pathname}?${params}`}
      hrefLang={next}
      lang={next}
      aria-label={copy.switchLabel}
    >
      {copy.switchTo}
    </Link>
  );
}
