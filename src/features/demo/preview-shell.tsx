import Link from "next/link";

export function PreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line">
        <nav className="page-container flex flex-wrap gap-6 py-6 text-sm">
          <Link className="font-bold" href="/">
            COMPANY A
          </Link>
          <Link href="/account">Account</Link>
          <Link href="/book">Test drive</Link>
          <Link href="/bookings">My bookings</Link>
          <Link href="/leads">Lead inbox</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>
      <div className="bg-accent px-6 py-3 text-center text-xs leading-5 text-white">
        Synthetic assessment data · Sign-in required · Bookings, leads and
        prices are saved · No external messages
      </div>
      <main id="main-content" className="page-container py-12">
        {children}
      </main>
    </>
  );
}
