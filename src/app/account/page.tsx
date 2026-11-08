import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/features/auth/session";
import { normalizeRole } from "@/features/auth/access";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { authCopy } from "@/features/auth/copy";
import { requestLanguage } from "@/lib/i18n/request-language";
import { SiteHeader } from "@/components/layout/site-header";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ access?: string }>;
}) {
  const session = await requireSession("/account");
  const role = normalizeRole(session.user.role);
  const query = await searchParams;
  const language = await requestLanguage();
  const copy = authCopy[language].account;

  return (
    <>
      <SiteHeader language={language} />
      <main id="main-content" className="page-container py-16">
        <h1 className="section-title">{copy.title(session.user.name)}</h1>
        <p className="mt-4 text-muted">
          {session.user.email} · {copy.roles[role]}
        </p>
        {query.access === "denied" && (
          <p role="alert" className="mt-6 text-red-700">
            {copy.denied}
          </p>
        )}
        <nav className="my-10 flex flex-wrap gap-6 text-accent">
          <Link href="/book">{copy.book} ↗</Link>
          <Link href="/bookings">{copy.bookings} ↗</Link>
          {role !== "buyer" && <Link href="/leads">{copy.leads} ↗</Link>}
          {role === "admin" && <Link href="/admin">{copy.admin} ↗</Link>}
        </nav>
        <p className="mb-8 max-w-xl text-sm leading-6 text-muted">{copy.note}</p>
        <SignOutButton language={language} />
      </main>
    </>
  );
}
