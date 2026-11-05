import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container flex min-h-screen flex-col items-start justify-center py-16">
      <p className="eyebrow">COMPANY A · 404</p>
      <h1 className="section-title mt-5">This page isn’t in the collection.</h1>
      <p className="mt-5 text-muted">
        Check the address or explore our sample cars.
      </p>
      <Link className="button-primary mt-8" href="/">
        Back to collection <span aria-hidden>↗</span>
      </Link>
    </main>
  );
}
