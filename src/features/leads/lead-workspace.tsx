"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Booking } from "@/features/bookings/types";
import { LeadDetail } from "./lead-detail";
import { useLeadViewStore } from "@/stores/lead-view-store";
import { responseLabel, responseState } from "./response-time";

export function LeadWorkspace({
  bookings,
  renderedAt,
}: {
  bookings: Booking[];
  /** Server time of this render, so timers are correct before the first tick. */
  renderedAt: number;
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const {
    selected,
    search,
    select: setSelected,
    searchFor: setSearch,
  } = useLeadViewStore();
  const [now, setNow] = useState(renderedAt);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const visible = bookings.filter((lead) =>
    `${lead.buyer} ${lead.consultant} ${lead.carName} ${lead.carId}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const lead = visible.find((booking) => booking.id === selected) ?? visible[0];

  return (
    <>
      <p className="eyebrow">LEAD DESK</p>
      <h1 className="section-title mt-4">Every enquiry. A clear next step.</h1>
      <p className="mt-4 text-muted">
        Booking leads are auto-assigned by showroom, car eligibility and active
        workload. Consultants see their assigned leads; admins see all leads.
      </p>
      <button
        className="mt-5 text-sm text-accent underline"
        disabled={refreshing}
        onClick={() => startRefresh(() => router.refresh())}
      >
        {refreshing ? "Refreshing…" : "Refresh leads"}
      </button>
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section>
          <label className="field-label">
            Search leads
            <input
              className="field"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buyer, consultant or car"
            />
          </label>
          <div className="mt-5 space-y-3">
            {visible.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`w-full border p-5 text-left ${lead?.id === item.id ? "border-accent bg-surface" : "border-line"}`}
              >
                <div className="flex justify-between gap-3">
                  <strong>{item.buyer}</strong>
                  <span className="text-xs">{item.leadStatus}</span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {item.carName} · {item.consultant}
                </p>
                <ResponseTimer lead={item} now={now} />
              </button>
            ))}
          </div>
          {!visible.length && (
            <p className="mt-8 text-sm text-muted">
              No matching leads.{" "}
              <Link className="text-accent underline" href="/book">
                Create a test-drive booking
              </Link>
              .
            </p>
          )}
        </section>
        {lead && <LeadDetail key={lead.id} lead={lead} />}
      </div>
    </>
  );
}

const timerTone = {
  waiting: "text-accent",
  overdue: "font-medium text-red-700",
  met: "text-muted",
  missed: "text-muted",
} as const;

function ResponseTimer({ lead, now }: { lead: Booking; now: number }) {
  const state = responseState(lead, now);
  return <p className={`mt-3 text-xs ${timerTone[state.kind]}`}>{responseLabel(state)}</p>;
}
