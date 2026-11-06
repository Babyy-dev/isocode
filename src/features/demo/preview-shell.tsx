import Link from "next/link";
import { layoutCopy } from "@/components/layout/copy";
import { LanguageToggle } from "@/components/layout/language-toggle";
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
  const links = navLinks.filter((link) => canAccess(session?.user.role, link.roles));
  return (
    <>
      <header className="border-b border-line">
        <div className="page-container flex flex-wrap items-center justify-between gap-4 py-5">
          <nav aria-label={copy.nav.label} className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link className="font-bold" href="/">
              COMPANY A
            </Link>
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {copy.nav[link.label]}
              </Link>
            ))}
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
