"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Car } from "@/features/cars/types";
import type { CityPrice } from "@/features/pricing/types";
import { calculateOnRoadPrice } from "@/features/pricing/calculate-price";
import { bookTestDrive } from "./actions";
import type { OccupiedSlot } from "./types";
import { useRouter } from "next/navigation";
import { demoShowrooms, demoTimes } from "@/features/demo/data";
import { indiaDate } from "@/lib/date";
import { formatPrice } from "@/features/cars/presentation";

export function BookingForm({
  cars,
  prices,
  cities,
  slots,
}: {
  cars: Car[];
  prices: CityPrice[];
  cities: { _id: string; name: string }[];
  slots: OccupiedSlot[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [requestId] = useState(() => crypto.randomUUID());
  const [carId, setCarId] = useState<string>(
    cars.find((car) => car.status === "Available")?.stockId ?? "",
  );
  const [city, setCity] = useState("lucknow");
  const [showroom, setShowroom] = useState(demoShowrooms[0]);
  const [date, setDate] = useState("");
  const [now, setNow] = useState(0);
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const price = prices.find(
    (row) => row.carId === carId && row.cityId === city,
  );

  function submit(form: FormData) {
    if (!form.get("consent"))
      return setMessage("Consent is required for booking and follow-up.");
    if (!price)
      return setMessage("No current price is available for this car and city.");
    startTransition(async () => {
      try {
        const result = await bookTestDrive({
          requestId,
          carId,
          cityId: city,
          priceVersion: price.version,
          showroom,
          date,
          time,
          buyer: String(form.get("buyer")),
          needs: String(form.get("needs")),
          consent: form.get("consent") === "on",
          aiConsent: form.get("aiConsent") === "on",
        });
        if (result.error) {
          setMessage(result.error);
          router.refresh();
        } else {
          setConfirmation(result.id ?? "");
          setMessage("");
        }
      } catch {
        setMessage("Unable to book. Check your connection and try again.");
      }
    });
  }

  if (confirmation)
    return (
      <section className="max-w-xl border border-line p-8">
        <p className="eyebrow">TEST DRIVE CONFIRMED</p>
        <h1 className="section-title mt-4">Your drive is on the calendar.</h1>
        <p className="mt-6">
          {date} · {time} IST · {showroom}
        </p>
        <p className="mt-4 text-sm text-muted">
          Reference {confirmation.slice(0, 8)}. Your lead is assigned to a named
          consultant profile. Your slot is saved in this assessment app; no
          external message was sent.
        </p>
        <Link className="button-primary mt-8" href="/bookings">
          View my bookings ↗
        </Link>
      </section>
    );

  return (
    <>
      <p className="eyebrow">30 MINUTES. YOUR NEXT CAR.</p>
      <h1 className="section-title mt-4">Book a test drive</h1>
      <form
        action={submit}
        className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]"
      >
        <fieldset disabled={pending} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field-label">
              Car / demo resource
              <select
                className="field"
                value={carId}
                onChange={(event) => {
                  setCarId(event.target.value);
                  setTime("");
                }}
              >
                {cars
                  .filter((car) => car.status === "Available")
                  .map((car) => (
                    <option key={car.stockId} value={car.stockId}>
                      {car.model} · {car.variant}
                    </option>
                  ))}
              </select>
            </label>
            <label className="field-label">
              Price city
              <select
                className="field"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              >
                {cities.map((value) => (
                  <option key={value._id} value={value._id}>
                    {value.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field-label">
            Showroom
            <select
              className="field"
              value={showroom}
              onChange={(event) => {
                setShowroom(event.target.value);
                setTime("");
              }}
            >
              {demoShowrooms.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Date
            <input
              className="field"
              type="date"
              required
              min={indiaDate()}
              value={date}
              onChange={(event) => {
                setNow(Date.now());
                setDate(event.target.value);
                setTime("");
              }}
            />
          </label>
          <fieldset>
            <legend className="mb-3 text-sm">
              Available slots · India time
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {demoTimes.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={
                    !date ||
                    slots.some(
                      (slot) =>
                        slot.carId === carId &&
                        slot.showroom === showroom &&
                        slot.date === date &&
                        slot.time === value,
                    ) ||
                    Date.parse(`${date}T${value}:00+05:30`) <= now
                  }
                  aria-pressed={time === value}
                  onClick={() => setTime(value)}
                  className={`border border-line p-3 text-sm disabled:cursor-not-allowed disabled:opacity-30 ${time === value ? "bg-accent text-white" : "bg-white"}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="field-label">
            Demo buyer name
            <input
              className="field"
              name="buyer"
              required
              maxLength={80}
              placeholder="Use a fictional name"
            />
          </label>
          <label className="field-label">
            What matters to you?
            <textarea
              className="field min-h-28"
              name="needs"
              maxLength={1000}
              placeholder="For example: automatic, family use, weekend availability"
            />
          </label>
          <label className="flex gap-3 text-sm leading-6">
            <input className="mt-1" type="checkbox" name="consent" required />I
            consent to using this fictional information for this demo booking
            and follow-up. I can opt out from My bookings.
          </label>
          <label className="flex gap-3 text-sm leading-6">
            <input className="mt-1" type="checkbox" name="aiConsent" />
            Optional: allow OpenAI to help staff summarise my stated needs and
            draft a reply. Staff review the result. I can withdraw this
            permission in My bookings; booking does not require it.
          </label>
          <button
            disabled={
              !time || !price || price.validThrough < indiaDate() || pending
            }
            className="button-primary disabled:opacity-40"
          >
            {pending ? "Reserving…" : "Confirm test drive"}
          </button>
          <p role="alert" className="text-sm text-red-700">
            {message}
          </p>
        </fieldset>
        <aside className="self-start bg-surface p-8">
          <p className="eyebrow">YOUR PRICE SNAPSHOT</p>
          <p className="mt-4 text-3xl">
            {price
              ? formatPrice(calculateOnRoadPrice(price) / 100)
              : "Price unavailable"}
          </p>
          <p className="mt-4 text-sm leading-6 text-muted">
            Illustrative on-road price for{" "}
            {cities.find((item) => item._id === city)?.name ?? city}. Valid
            through {price?.validThrough ?? "—"}. Prices may change. Your
            booking keeps a copy of this price.
          </p>
          <p className="mt-6 text-xs leading-5">
            Slots are reserved in MongoDB. Availability is checked again when
            you confirm. Messages are simulated; no SMS or WhatsApp is sent.
          </p>
        </aside>
      </form>
    </>
  );
}
