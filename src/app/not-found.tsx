import Link from "next/link";
import { layoutCopy } from "@/components/layout/copy";
import { requestLanguage } from "@/lib/i18n/request-language";

export default async function NotFound() {
  const copy = layoutCopy[await requestLanguage()].notFound;
  return (
    <main className="page-container flex min-h-screen flex-col items-start justify-center py-16">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1 className="section-title mt-5">{copy.title}</h1>
      <p className="mt-5 text-muted">{copy.text}</p>
      <Link className="button-primary mt-8" href="/">
        {copy.action} <span aria-hidden>↗</span>
      </Link>
    </main>
  );
}
