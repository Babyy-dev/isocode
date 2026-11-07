import { layoutCopy } from "@/components/layout/copy";
import { requestLanguage } from "@/lib/i18n/request-language";

/**
 * Page shell for the signed-in workspace (book, bookings, leads, admin). The site-wide
 * header comes from the root layout; this adds the demo-data banner and the content area.
 */
export async function PreviewShell({ children }: { children: React.ReactNode }) {
  const copy = layoutCopy[await requestLanguage()];
  return (
    <>
      <div className="page-container mt-3">
        <p className="rounded-xl bg-accent px-5 py-2.5 text-center text-xs leading-5 text-on-accent">
          {copy.demoBanner}
        </p>
      </div>
      <main id="main-content" className="page-container py-12">
        {children}
      </main>
    </>
  );
}
