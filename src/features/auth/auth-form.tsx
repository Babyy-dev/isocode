"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "./client";
import { safeReturnTo } from "./access";
import { authErrorMessage } from "./error-message";
import { authCopy } from "./copy";
import { LanguageToggle } from "@/components/layout/language-toggle";
import type { Language } from "@/lib/i18n/language";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  returnTo: string;
  language: Language;
};

export function AuthForm({ mode, returnTo, language }: AuthFormProps) {
  const copy = authCopy[language];
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const isSignUp = mode === "sign-up";
  const destination = safeReturnTo(returnTo);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    setPending(true);
    setError("");
    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            email,
            password,
            name: String(form.get("name")).trim(),
          })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(authErrorMessage(result.error.status, isSignUp, language));
        setPending(false);
        return;
      }
      // Full navigation also clears the temporary preview state between identities.
      window.location.assign(destination);
    } catch {
      setError(authErrorMessage(undefined, isSignUp, language));
      setPending(false);
    }
  }

  return (
    <main className="page-container flex min-h-screen items-center justify-center py-12">
      <section className="w-full max-w-md">
        <div className="flex items-center justify-between gap-4">
          <Link className="eyebrow" href="/">
            COMPANY A · BRAND X
          </Link>
          <LanguageToggle language={language} />
        </div>
        <h1 className="section-title mt-6">
          {isSignUp ? copy.signUpTitle : copy.signInTitle}
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          {isSignUp ? copy.signUpIntro : copy.signInIntro}
        </p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          {isSignUp && (
            <label className="field-label">
              {copy.name}
              <input
                className="field"
                name="name"
                autoComplete="name"
                required
                minLength={1}
                maxLength={80}
              />
            </label>
          )}
          <label className="field-label">
            {copy.email}
            <input
              className="field"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label className="field-label">
            {copy.password}
            <input
              className="field"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={isSignUp ? 12 : 1}
              maxLength={128}
            />
          </label>
          {isSignUp && (
            <p className="text-xs text-muted">{copy.passwordHint}</p>
          )}
          <button
            disabled={pending}
            className="button-primary w-full disabled:opacity-50"
          >
            {pending ? copy.wait : isSignUp ? copy.createAccount : copy.signIn}
          </button>
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        </form>
        <p className="mt-6 text-sm text-muted">
          {isSignUp ? copy.haveAccount : copy.newHere}
          <Link
            className="text-accent underline"
            href={`/${isSignUp ? "sign-in" : "sign-up"}?returnTo=${encodeURIComponent(destination)}`}
          >
            {isSignUp ? copy.signIn : copy.createLink}
          </Link>
        </p>
      </section>
    </main>
  );
}
