import Link from "next/link";
import { layoutCopy } from "@/components/layout/copy";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { MobileMenu, type MenuLink } from "@/components/layout/mobile-menu";
import type { HeaderUser } from "@/components/layout/profile-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { requestLanguage } from "@/lib/i18n/request-language";
import { getSession } from "@/features/auth/session";
import { canAccess, type UserRole } from "@/features/auth/access";

type NavLink = { href: string; label: keyof (typeof layoutCopy)["en"]["nav"]; roles: UserRole[] };

const everyone: UserRole[] = ["buyer", "consultant", "admin"];
const navLinks: NavLink[] = [
  { href: "/account", label: "account", roles: everyone },
  { href: "/book", label: "testDrive", roles: everyone },
  { href: "/bookings", label: "bookings", roles: everyone },
  { href: "/leads", label: "leads", roles: ["consultant", "admin"] },
  { href: "/admin", label: "admin", roles: ["admin"] },
];

export async function PreviewShell({ children }: { children: React.ReactNode }) {
  const [language, session] = await Promise.all([requestLanguage(), getSession()]);
  const copy = layoutCopy[language];
  // Signed-out visitors are redirected by each page; show them only the buyer links meanwhile.
  const links: MenuLink[] = navLinks
    .filter((link) => canAccess(session?.user.role, link.roles))
    .map((link) => ({ href: link.href, label: copy.nav[link.label] }));
  const user: HeaderUser | null = session?.user
    ? { name: session.user.name }
    : null;
  return (
    <>
      <header className="relative border-b border-line bg-page">
        <div className="page-container flex min-h-16 items-center justify-between gap-4 py-3">
          <Link className="font-bold" href="/">
            COMPANY A
          </Link>
          <nav aria-label={copy.nav.label} className="hidden flex-1 flex-wrap gap-x-6 gap-y-2 text-sm sm:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-accent">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <ThemeToggle language={language} />
            <LanguageToggle language={language} />
          </div>
          <MobileMenu links={links} language={language} user={user} />
        </div>
      </header>
      <div className="bg-accent px-6 py-3 text-center text-xs leading-5 text-on-accent">
        {copy.demoBanner}
      </div>
      <main id="main-content" className="page-container py-12">
        {children}
      </main>
    </>
  );
}
