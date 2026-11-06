import Link from "next/link";
import { layoutCopy } from "@/components/layout/copy";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { requestLanguage } from "@/lib/i18n/request-language";

export async function PreviewShell({ children }: { children: React.ReactNode }) {
  const language = await requestLanguage();
  const copy = layoutCopy[language];
  return (
    <>
      <header className="border-b border-line">
        <div className="page-container flex flex-wrap items-center justify-between gap-4 py-5">
          <nav aria-label={copy.nav.label} className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link className="font-bold" href="/">
              COMPANY A
            </Link>
            <Link href="/account">{copy.nav.account}</Link>
            <Link href="/book">{copy.nav.testDrive}</Link>
            <Link href="/bookings">{copy.nav.bookings}</Link>
            <Link href="/leads">{copy.nav.leads}</Link>
            <Link href="/admin">{copy.nav.admin}</Link>
          </nav>
          <LanguageToggle language={language} />
        </div>
      </header>
      <div className="bg-accent px-6 py-3 text-center text-xs leading-5 text-white">
        {copy.demoBanner}
      </div>
      <main id="main-content" className="page-container py-12">
        {children}
      </main>
    </>
  );
}
