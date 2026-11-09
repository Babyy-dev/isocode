import Link from "next/link";
import { layoutCopy } from "./copy";
import { LanguageToggle } from "./language-toggle";
import { MobileMenu, type MenuLink } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";
import { carCopy } from "@/features/cars/copy";
import type { Language } from "@/lib/i18n/language";

type SiteHeaderProps = { language: Language };

export function SiteHeader({ language }: SiteHeaderProps) {
  const copy = carCopy[language];
  const nav = layoutCopy[language].nav;
  const links: MenuLink[] = [
    { href: "/?type=New#collection", label: copy.newCars },
    { href: "/?type=Used#collection", label: copy.usedCars },
    { href: "/book", label: nav.testDrive },
    { href: "/account", label: nav.account },
  ];

  return (
    <header className="relative border-b border-line bg-page">
      <a className="skip-link" href="#main-content">
        {copy.skip}
      </a>
      <div className="page-container flex min-h-20 items-center justify-between gap-5 py-4 sm:min-h-24">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Company A — Brand X"
        >
          <span className="flex size-10 items-center justify-center bg-ink text-xl font-bold text-page">
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
          className="hidden gap-7 text-sm font-medium sm:flex"
        >
          {links.map((link) => (
            <Link key={link.href} className="nav-link" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 text-sm sm:flex">
          <span className="mr-2 hidden text-muted lg:inline">{copy.location}</span>
          <ThemeToggle language={language} />
          <LanguageToggle language={language} />
        </div>
        <MobileMenu links={links} language={language} />
      </div>
    </header>
  );
}
