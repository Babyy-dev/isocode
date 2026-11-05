import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/features/auth/session";
import { normalizeRole } from "@/features/auth/access";
import { SignOutButton } from "@/features/auth/sign-out-button";

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

  return (
    <main className="page-container py-16">
      <Link href="/" className="eyebrow">
        COMPANY A · HOME
      </Link>
      <h1 className="section-title mt-6">Welcome, {session.user.name}</h1>
      <p className="mt-4 text-muted">
        {session.user.email} · {role}
      </p>
      {query.access === "denied" && (
        <p role="alert" className="mt-6 text-red-700">
          Your account does not have permission for that workspace.
        </p>
      )}
      <nav className="my-10 flex flex-wrap gap-6 text-accent">
        <Link href="/book">Book a test drive ↗</Link>
        <Link href="/bookings">My bookings ↗</Link>
        {role !== "buyer" && <Link href="/leads">Lead inbox ↗</Link>}
        {role === "admin" && <Link href="/admin">Admin ↗</Link>}
      </nav>
      <p className="mb-8 max-w-xl text-sm leading-6 text-muted">
        Your account and session use MongoDB. Booking, price-editing and lead
        workflows now store records in MongoDB. External messages are simulated.
      </p>
      <SignOutButton />
    </main>
  );
}
