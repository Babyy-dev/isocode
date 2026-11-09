"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/i18n/language";
import { layoutCopy } from "./copy";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";

export type MenuLink = { href: string; label: string };

/** Phone-only menu (below the `sm` breakpoint): a ☰ button that opens the links and language toggle. */
export function MobileMenu({ links, language }: { links: MenuLink[]; language: Language }) {
  const copy = layoutCopy[language];
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panel.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? copy.closeMenu : copy.openMenu}
        className="grid size-11 place-items-center rounded border border-line"
      >
        <MenuIcon open={open} />
      </button>
      {open && (
        <div
          ref={panel}
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-40 border-b border-line bg-page shadow-sm"
        >
          <nav aria-label={copy.nav.label} className="page-container py-2">
            <ul>
              {links.map((link) => (
                <li key={link.href} className="border-b border-line last:border-b-0">
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center text-base hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-3 py-4">
              <LanguageToggle language={language} className="w-full" />
              <ThemeToggle language={language} withLabel className="w-full" />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      {open ? (
        <path d="M5 5l10 10M15 5L5 15" />
      ) : (
        <path d="M3 6h14M3 10h14M3 14h14" />
      )}
    </svg>
  );
}
