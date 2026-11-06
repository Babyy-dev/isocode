import Link from "next/link";
import { carCopy } from "@/features/cars/copy";
import type { Language } from "@/lib/i18n/language";

export function SiteFooter({ language }: { language: Language }) {
  const copy = carCopy[language];

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="page-container py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="max-w-md text-2xl font-medium tracking-tight">
              {copy.footerTitle}
            </p>
            <p className="mt-4 text-sm text-muted">{copy.footerText}</p>
          </div>
          <Link
            href={`/?lang=${language}#collection`}
            className="text-sm font-semibold text-accent"
          >
            {copy.browse} <span aria-hidden>↗</span>
          </Link>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-line pt-5 text-xs text-muted sm:flex-row">
          <p>{copy.demo}</p>
          <p>{copy.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
