"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page-container py-24">
      <h1 className="section-title">Something went wrong.</h1>
      <p className="mt-4 text-muted">
        We couldn’t load this page. Please try again.
      </p>
      <p lang="hi" className="mt-2 text-sm text-muted">
        पेज लोड नहीं हो सका। कृपया फिर से कोशिश करें।
      </p>
      <button className="button-primary mt-8" onClick={reset}>
        Try again / फिर से कोशिश करें
      </button>
    </main>
  );
}
