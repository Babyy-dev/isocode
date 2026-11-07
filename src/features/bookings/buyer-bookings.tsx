"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { calculateOnRoadPrice } from "@/features/pricing/calculate-price";
import { updateBuyerBooking } from "./actions";
import type { Booking } from "./types";
import { MessageTimeline } from "@/features/messaging/components/message-timeline";
import { formatPrice } from "@/features/cars/presentation";
import type { Language } from "@/lib/i18n/language";
import { bookingCopy } from "./copy";
import { TradeInSummary } from "@/features/trade-in/components/trade-in-summary";

export function BuyerBookings({
  bookings,
  language,
}: {
  bookings: Booking[];
  language: Language;
}) {
  const copy = bookingCopy[language].list;
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  function update(
    id: string,
    action: "cancel" | "opt-out" | "opt-in" | "ai-opt-in" | "ai-opt-out",
  ) {
    startTransition(async () => {
      try {
        const result = await updateBuyerBooking(id, action);
        setMessage(result.error ?? copy.updated);
      } catch {
        setMessage(copy.network);
      }
    });
  }
  return (
    <>
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1 className="section-title mt-4">{copy.title}</h1>
      <p className="mt-4 text-muted">{copy.intro}</p>
      <p role="status" className="mt-4 text-sm text-accent">
        {message}
      </p>
      {!bookings.length && (
        <div className="mt-10 border border-dashed border-line p-10">
          <p>{copy.empty}</p>
          <Link href="/book" className="button-primary mt-6">
            {copy.choose}
          </Link>
        </div>
      )}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {bookings.map((booking) => (
          <article key={booking.id} className="border border-line p-6">
            <p className="eyebrow">{copy.status[booking.status]}</p>
            <h2 className="mt-3 text-xl">
              {booking.carName}
            </h2>
            <p className="mt-3 text-sm">
              {booking.date} · {booking.time} IST
            </p>
            <p className="mt-2 text-sm text-muted">
              {booking.showroom} · {copy.consultant}: {booking.consultant}
            </p>
            <p className="mt-4 text-sm">
              {copy.snapshot}:{" "}
              {formatPrice(calculateOnRoadPrice(booking.price) / 100)}
            </p>
            <TradeInSummary tradeIn={booking.tradeIn} language={language} />
            <div className="mt-6 flex flex-wrap gap-5">
              {booking.status === "Confirmed" && (
                <button
                  disabled={pending}
                  className="text-sm text-accent underline disabled:opacity-40"
                  onClick={() => update(booking.id, "cancel")}
                >
                  {copy.cancel}
                </button>
              )}
              <button
                disabled={pending}
                className="text-sm text-accent underline disabled:opacity-40"
                onClick={() =>
                  update(booking.id, booking.optedOut ? "opt-in" : "opt-out")
                }
              >
                {booking.optedOut ? copy.optIn : copy.optOut}
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
                {booking.aiConsent ? copy.aiWithdraw : copy.aiAllow}
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">{copy.aiNote}</p>
            <p className="mt-4 text-xs text-muted">
              {booking.optedOut ? copy.optedOut : copy.followUp}
            </p>
            <div className="mt-6 border-t border-line pt-5">
              <MessageTimeline
                messages={booking.messages}
                title={copy.messages}
                language={language}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
