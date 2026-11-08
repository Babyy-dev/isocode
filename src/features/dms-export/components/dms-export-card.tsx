import { indiaDate } from "@/lib/date";

/** A plain GET form: the browser downloads the CSV directly, no client JavaScript needed. */
export function DmsExportCard() {
  const today = indiaDate();
  return (
    <section className="mt-16 border border-line p-6 sm:p-8" aria-labelledby="dms-export-title">
      <p className="eyebrow">DAILY DMS EXPORT</p>
      <h2 id="dms-export-title" className="mt-3 text-2xl font-medium tracking-tight">
        Download a day&apos;s leads for the DMS
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        One row per test-drive lead created that day (India time): showroom, consultant, car,
        slot, status, response time, buyer name and email, the saved price breakup and any
        trade-in. Free-text needs, AI drafts and messages are left out.
      </p>
      <form action="/api/admin/dms-export" method="get" className="mt-6 flex flex-wrap items-end gap-4">
        <label className="field-label">
          Day
          <input className="field" type="date" name="date" required max={today} defaultValue={today} />
        </label>
        <button className="button-primary">Download CSV</button>
      </form>
    </section>
  );
}
