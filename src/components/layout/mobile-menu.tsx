"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/i18n/language";
import { authClient } from "@/features/auth/client";
import { layoutCopy } from "./copy";
import type { HeaderUser } from "./profile-menu";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";

export type MenuLink = { href: string; label: string };

/** Phone-only menu (below the `sm` breakpoint): a ☰ button that opens the links, account actions and toggles. */
export function MobileMenu({
  links,
  language,
  user,
}: {
  links: MenuLink[];
  language: Language;
  user: HeaderUser | null;
}) {
  const copy = layoutCopy[language];
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      // A full navigation clears any memory-only preview state between identities.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/");
    }
  }

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
        className="grid size-11 place-items-center rounded-xl border border-line transition-colors hover:border-accent"
      >
        <MenuIcon open={open} />
      </button>
      {open && (
        <div
          ref={panel}
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-page shadow-xl"
        >
          <nav aria-label={copy.nav.label} className="px-4 py-2">
            <ul>
              {links.map((link) => (
                <li key={link.href} className="border-b border-line">
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
            {user ? (
              <div className="py-3">
                <p className="px-1 pb-2 text-xs text-muted">
                  {copy.nav.signedInAs}{" "}
                  <span className="font-semibold text-ink">{user.name}</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {user.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-center justify-center rounded-xl border border-line px-2 text-center text-sm hover:border-accent"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    disabled={signingOut}
                    onClick={signOut}
                    className="flex min-h-11 items-center justify-center rounded-xl border border-line text-sm hover:border-accent disabled:cursor-wait disabled:opacity-60"
                  >
                    {signingOut ? copy.nav.signingOut : copy.nav.signOut}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 py-3">
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center justify-center rounded-xl border border-line text-sm hover:border-accent"
                >
                  {copy.nav.signIn}
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center justify-center rounded-xl border border-transparent bg-accent text-sm text-on-accent hover:bg-accent-strong"
                >
                  {copy.nav.signUp}
                </Link>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 border-t border-line py-3">
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
