"use client";

import { useState } from "react";
import { authClient } from "./client";
import { authCopy } from "./copy";
import type { Language } from "@/lib/i18n/language";

export function SignOutButton({ language }: { language: Language }) {
  const copy = authCopy[language];
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      // A full navigation clears all memory-only preview records between users.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/");
    } catch {
      setError(copy.signOutFailed);
      setPending(false);
    }
  }

  return (
    <div>
      <button className="button-primary" disabled={pending} onClick={signOut}>
        {pending ? copy.signingOut : copy.signOut}
      </button>
      <p role="alert" className="mt-3 text-sm text-danger">
        {error}
      </p>
    </div>
  );
}
