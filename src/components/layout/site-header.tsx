import Link from "next/link";
import { carCopy } from "@/features/cars/copy";
import type { Language } from "@/features/cars/presentation";

type SiteHeaderProps = { language: Language; path?: string };

export function SiteHeader({ language, path = "/" }: SiteHeaderProps) {
  const copy = carCopy[language];
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
          aria-label={language === "hi" ? "मुख्य नेविगेशन" : "Main navigation"}
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
            {language === "hi" ? "डेमो बुकिंग" : "Demo booking"}
          </Link>
          <Link className="nav-link" href="/account">
            {language === "hi" ? "खाता" : "Account"}
          </Link>
        </nav>
        <div className="flex items-center gap-5 text-sm">
          <span className="hidden text-muted lg:inline">{copy.location}</span>
          <Link
            className="rounded border border-line px-3 py-2 hover:border-accent"
            href={`${path}?lang=${language === "en" ? "hi" : "en"}`}
            hrefLang={language === "en" ? "hi" : "en"}
          >
            {language === "en" ? "हिन्दी" : "English"}
          </Link>
        </div>
      </div>
    </header>
  );
}
