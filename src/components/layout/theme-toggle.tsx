"use client";

import { THEME_COOKIE, THEME_COOKIE_MAX_AGE, parseTheme, type Theme } from "@/lib/theme/theme";
import type { Language } from "@/lib/i18n/language";
import { layoutCopy } from "./copy";

/**
 * Flips light/dark instantly on the page and remembers it in a cookie, which the root layout
 * reads so the next page arrives in the same theme. Which icon shows is decided by CSS
 * (`.theme-icon-*` in globals.css), so the button is correct before any JavaScript runs.
 */
export function ThemeToggle({
  language,
  withLabel = false,
  className = "",
}: {
  language: Language;
  withLabel?: boolean;
  className?: string;
}) {
  const copy = layoutCopy[language].theme;

  function toggleTheme() {
    const root = document.documentElement;
    const next: Theme = parseTheme(root.dataset.theme) === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={copy.label}
      title={copy.label}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm transition-colors hover:border-accent ${className}`}
    >
      <span className="theme-icon-moon inline-flex items-center gap-2">
        <MoonIcon />
        {withLabel && copy.dark}
      </span>
      <span className="theme-icon-sun inline-flex items-center gap-2">
        <SunIcon />
        {withLabel && copy.light}
      </span>
    </button>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M16.5 12.3A7 7 0 0 1 7.7 3.5a7 7 0 1 0 8.8 8.8z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6L16 16M4 16l1.4-1.4M14.6 5.4L16 4" />
    </svg>
  );
}
