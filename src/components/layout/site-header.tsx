import Link from "next/link";
import { layoutCopy } from "./copy";
import { LanguageToggle } from "./language-toggle";
import { carCopy } from "@/features/cars/copy";
import type { Language } from "@/lib/i18n/language";

type SiteHeaderProps = { language: Language };

export function SiteHeader({ language }: SiteHeaderProps) {
  const copy = carCopy[language];
  const nav = layoutCopy[language].nav;
  const home = language === "hi" ? "/?lang=hi" : "/";

  return (
    <header className="border-b border-line bg-white">
      <a className="skip-link" href="#main-content">
        {copy.skip}
      </a>
      <div className="page-container flex min-h-24 flex-wrap items-center justify-between gap-5 py-5">
        <Link
          href={home}
          className="flex items-center gap-3"
          aria-label="Company A — Brand X"
        >
          <span className="flex size-10 items-center justify-center bg-ink text-xl font-bold text-white">
            X
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-tight">
              COMPANY A
            </span>
            <span className="block text-[10px] tracking-[0.25em] text-muted">
              AUTHORISED BRAND X DEALER
            </span>
          </span>
        </Link>
        <nav
          aria-label={nav.label}
          className="order-3 flex w-full gap-7 text-sm font-medium sm:order-none sm:w-auto"
        >
          <Link
            className="nav-link"
            href={`/?type=New&lang=${language}#collection`}
          >
            {copy.newCars}
          </Link>
          <Link
            className="nav-link"
            href={`/?type=Used&lang=${language}#collection`}
          >
            {copy.usedCars}
          </Link>
          <Link className="nav-link" href="/book">
            {nav.testDrive}
          </Link>
          <Link className="nav-link" href="/account">
            {nav.account}
          </Link>
        </nav>
        <div className="flex items-center gap-5 text-sm">
          <span className="hidden text-muted lg:inline">{copy.location}</span>
          <LanguageToggle language={language} />
        </div>
      </div>
    </header>
  );
}
