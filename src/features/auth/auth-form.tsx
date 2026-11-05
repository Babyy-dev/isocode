"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "./client";
import { safeReturnTo } from "./access";
import { authErrorMessage } from "./error-message";

type AuthFormProps = { mode: "sign-in" | "sign-up"; returnTo: string };

export function AuthForm({ mode, returnTo }: AuthFormProps) {
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
        setError(authErrorMessage(result.error.status, isSignUp));
        setPending(false);
        return;
      }
      // Full navigation also clears the temporary preview state between identities.
      window.location.assign(destination);
    } catch {
      setError(authErrorMessage(undefined, isSignUp));
      setPending(false);
    }
  }

  return (
    <main className="page-container flex min-h-screen items-center justify-center py-12">
      <section className="w-full max-w-md">
        <Link className="eyebrow" href="/">
          COMPANY A · BRAND X
        </Link>
        <h1 className="section-title mt-6">
          {isSignUp ? "Create your buyer account" : "Welcome back"}
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          {isSignUp
            ? "Browse, plan your next drive and keep your account in one place. Staff privileges cannot be selected at signup."
            : "Sign in to access your buyer or assigned staff workspace."}
        </p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          {isSignUp && (
            <label className="field-label">
              Name
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
            Email
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
            Password
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
            <p className="text-xs text-muted">
              At least 12 characters. Email verification and password reset are
              not configured yet.
            </p>
          )}
          <button
            disabled={pending}
            className="button-primary w-full disabled:opacity-50"
          >
            {pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
          </button>
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        </form>
        <p className="mt-6 text-sm text-muted">
          {isSignUp ? "Already registered? " : "New here? "}
          <Link
            className="text-accent underline"
            href={`/${isSignUp ? "sign-in" : "sign-up"}?returnTo=${encodeURIComponent(destination)}`}
          >
            {isSignUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
    </main>
  );
}
