"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { calculateOnRoadPrice } from "@/features/pricing/calculate-price";
import { updateBuyerBooking } from "./actions";
import type { Booking } from "./types";
import { MessageTimeline } from "@/features/messaging/components/message-timeline";
import { formatPrice } from "@/features/cars/presentation";

export function BuyerBookings({ bookings }: { bookings: Booking[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  function update(
    id: string,
    action: "cancel" | "opt-out" | "opt-in" | "ai-opt-in" | "ai-opt-out",
  ) {
    startTransition(async () => {
      try {
        const result = await updateBuyerBooking(id, action);
        setMessage(result.error ?? "Booking updated.");
      } catch {
        setMessage("Unable to update. Please try again.");
      }
    });
  }
  return (
    <>
      <p className="eyebrow">YOUR ACCOUNT</p>
      <h1 className="section-title mt-4">Your test drives</h1>
      <p className="mt-4 text-muted">
        Bookings saved to your account. Cancellation releases your slot.
      </p>
      <p role="status" className="mt-4 text-sm text-accent">
        {message}
      </p>
      {!bookings.length && (
        <div className="mt-10 border border-dashed border-line p-10">
          <p>No bookings yet.</p>
          <Link href="/book" className="button-primary mt-6">
            Choose a test drive
          </Link>
        </div>
      )}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {bookings.map((booking) => (
          <article key={booking.id} className="border border-line p-6">
            <p className="eyebrow">{booking.status}</p>
            <h2 className="mt-3 text-xl">
              {booking.carId} · {booking.buyer}
            </h2>
            <p className="mt-3 text-sm">
              {booking.date} · {booking.time} IST
            </p>
            <p className="mt-2 text-sm text-muted">
              {booking.showroom} · {booking.consultant}
            </p>
            <p className="mt-4 text-sm">
              Price snapshot:{" "}
              {formatPrice(calculateOnRoadPrice(booking.price) / 100)}
            </p>
            <div className="mt-6 flex flex-wrap gap-5">
              {booking.status === "Confirmed" && (
                <button
                  disabled={pending}
                  className="text-sm text-accent underline disabled:opacity-40"
                  onClick={() => update(booking.id, "cancel")}
                >
                  Cancel booking
                </button>
              )}
              <button
                disabled={pending}
                className="text-sm text-accent underline disabled:opacity-40"
                onClick={() =>
                  update(booking.id, booking.optedOut ? "opt-in" : "opt-out")
                }
              >
                {booking.optedOut ? "Resume follow-up" : "Opt out of follow-up"}
              </button>
              <button
                disabled={pending}
                className="text-sm text-accent underline disabled:opacity-40"
                onClick={() =>
                  update(
                    booking.id,
                    booking.aiConsent ? "ai-opt-out" : "ai-opt-in",
                  )
                }
              >
                {booking.aiConsent
                  ? "Withdraw AI permission"
                  : "Allow OpenAI assistance"}
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">
              AI assistance is optional: stated needs may be sent to OpenAI for
              staff-reviewed summaries and drafts.
            </p>
            <p className="mt-4 text-xs text-muted">
              {booking.optedOut
                ? "Follow-up messages suppressed."
                : "Follow-up allowed. External delivery is simulated."}
            </p>
            <div className="mt-6 border-t border-line pt-5">
              <MessageTimeline messages={booking.messages} title="Messages to you" />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
