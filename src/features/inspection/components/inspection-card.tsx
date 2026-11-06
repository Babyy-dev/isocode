import type { Language } from "@/lib/i18n/language";
import { inspectionAreaLabels, inspectionCopy } from "../copy";
import type { Inspection, InspectionCheck } from "../types";
import { summariseInspection } from "../validate-inspection";

export function InspectionCard({
  inspection,
  language,
}: {
  inspection: Inspection | null | undefined;
  language: Language;
}) {
  const copy = inspectionCopy[language];
  return (
    <section id="inspection" className="mt-12 scroll-mt-8 border border-line p-6 sm:p-8">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h2 className="mt-3 text-2xl font-medium tracking-tight">{copy.title}</h2>
      {inspection ? (
        <InspectionBody inspection={inspection} language={language} />
      ) : (
        <p className="mt-4 text-sm leading-7 text-muted">{copy.missing}</p>
      )}
    </section>
  );
}

function InspectionBody({ inspection, language }: { inspection: Inspection; language: Language }) {
  const copy = inspectionCopy[language];
  const summary = summariseInspection(inspection);
  return (
    <>
      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
        <span>
          {copy.inspectedOn} {formatInspectionDate(inspection.inspectedOn, language)}
        </span>
        <span className="font-medium text-ink">{copy.passed(summary.passed, summary.total)}</span>
      </p>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {inspection.checks.map((check) => (
          <CheckRow key={check.area} check={check} language={language} />
        ))}
      </ul>
      <p className="mt-5 text-xs leading-6 text-muted">{copy.disclaimer}</p>
    </>
  );
}

function CheckRow({ check, language }: { check: InspectionCheck; language: Language }) {
  const copy = inspectionCopy[language];
  const passed = check.result === "pass";
  return (
    <li className="grid grid-cols-[1.5rem_1fr] gap-3 py-4 sm:grid-cols-[1.5rem_1fr_auto]">
      <span
        aria-hidden
        className={`mt-0.5 grid size-5 place-items-center rounded-full text-[0.65rem] ${
          passed ? "bg-accent text-white" : "border border-ink text-ink"
        }`}
      >
        {passed ? "✓" : "!"}
      </span>
      <div>
        <p className="text-sm font-medium">{inspectionAreaLabels[language][check.area]}</p>
        {check.note && <p className="mt-1 text-sm leading-6 text-muted">{check.note}</p>}
      </div>
      <span className={`col-start-2 text-xs sm:col-start-3 ${passed ? "text-muted" : "font-medium text-ink"}`}>
        {passed ? copy.pass : copy.attention}
      </span>
    </li>
  );
}

function formatInspectionDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
