import Link from "next/link";
import { layoutCopy } from "./copy";
import { HeaderShell } from "./header-shell";
import { LanguageToggle } from "./language-toggle";
import { MobileMenu, type MenuLink } from "./mobile-menu";
import { ProfileMenu, type HeaderUser } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";
import { carCopy } from "@/features/cars/copy";
import { normalizeRole } from "@/features/auth/access";
import { getSession } from "@/features/auth/session";
import type { Language } from "@/lib/i18n/language";

type SiteHeaderProps = { language: Language };

/** The one site-wide header, rendered by the root layout on every page. */
export async function SiteHeader({ language }: SiteHeaderProps) {
  const copy = carCopy[language];
  const nav = layoutCopy[language].nav;
  const session = await getSession();
  const role = normalizeRole(session?.user.role);
  // Account links depend on the role; pages still enforce access on the server.
  const user: HeaderUser | null = session?.user
    ? {
        name: session.user.name,
        links: [
          { href: "/account", label: nav.myAccount },
          { href: "/bookings", label: nav.bookings },
          ...(role !== "buyer" ? [{ href: "/leads", label: nav.leads }] : []),
          ...(role === "admin" ? [{ href: "/admin", label: nav.admin }] : []),
        ],
      }
    : null;
  const links: MenuLink[] = [
    { href: "/?type=New#collection", label: copy.newCars },
    { href: "/?type=Used#collection", label: copy.usedCars },
    { href: "/book", label: nav.testDrive },
  ];

  return (
    <HeaderShell>
      <a className="skip-link" href="#main-content">
        {copy.skip}
      </a>
      <div className="page-container">
        <div className="header-pill">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Company A — Brand X"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-ink text-xl font-bold text-page">
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
            <ThemeToggle language={language} />
            <LanguageToggle language={language} />
            <ProfileMenu language={language} user={user} />
          </div>
          <MobileMenu links={links} language={language} user={user} />
        </div>
      </div>
    </HeaderShell>
  );
}
