"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/i18n/language";
import { authClient } from "@/features/auth/client";
import { layoutCopy } from "./copy";

export type HeaderUser = { name: string };

/**
 * Account entry point for the desktop header: a profile icon that opens a small menu.
 * Signed out it offers Sign in / Sign up; signed in it shows the person's name with
 * My account and Sign out. It opens on hover (pointer devices) and on click/keyboard,
 * so it stays usable on touch and with a keyboard, and closes on Escape or outside click.
 */
export function ProfileMenu({
  language,
  user,
}: {
  language: Language;
  user: HeaderUser | null;
}) {
  const nav = layoutCopy[language].nav;
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const hoverCapable = useRef(false);

  useEffect(() => {
    hoverCapable.current = window.matchMedia("(hover: hover)").matches;
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

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

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? "";

  return (
    <div
      ref={wrap}
      className="profile-menu"
      data-open={open}
      onMouseEnter={() => hoverCapable.current && setOpen(true)}
      onMouseLeave={() => hoverCapable.current && setOpen(false)}
    >
      <button
        type="button"
        className="profile-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={nav.profile}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="profile-avatar" aria-hidden>
          {initial || <UserIcon />}
        </span>
        <CaretIcon />
      </button>
      {open && (
        <div className="profile-dropdown" role="menu">
          {user ? (
            <>
              <span className="profile-head">
                <span className="profile-head-label">{nav.signedInAs}</span>
                <span className="profile-head-name">{user.name}</span>
              </span>
              <Link
                href="/account"
                role="menuitem"
                className="profile-item"
                onClick={() => setOpen(false)}
              >
                <GearIcon />
                <span>
                  {nav.myAccount}
                  <span className="profile-item-hint">{nav.accountHint}</span>
                </span>
              </Link>
              <button
                type="button"
                role="menuitem"
                className="profile-item profile-item-button"
                disabled={signingOut}
                onClick={signOut}
              >
                <SignOutIcon />
                {signingOut ? nav.signingOut : nav.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                role="menuitem"
                className="profile-item"
                onClick={() => setOpen(false)}
              >
                <ArrowIcon />
                {nav.signIn}
              </Link>
              <Link
                href="/sign-up"
                role="menuitem"
                className="profile-item profile-item-accent"
                onClick={() => setOpen(false)}
              >
                <PlusIcon />
                {nav.signUp}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6.5" r="3.2" />
      <path d="M3.8 16.5a6.2 6.2 0 0 1 12.4 0" />
    </svg>
  );
}

function CaretIcon() {
  return (
    <svg className="profile-caret" aria-hidden width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h11M10 5l5 5-5 5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="6.5" />
      <path d="M10 7v6M7 10h6" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2.4" />
      <path d="M10 2.5v2M10 15.5v2M3.3 6.2l1.7 1M15 12.8l1.7 1M3.3 13.8l1.7-1M15 7.2l1.7-1" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3.5H5a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 5 16.5h3M12 13l3-3-3-3M15 10H8" />
    </svg>
  );
}
