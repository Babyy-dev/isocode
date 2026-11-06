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
import type { Language } from "@/lib/i18n/language";
import { bookingCopy } from "./copy";

export function BookingForm({
  cars,
  prices,
  cities,
  slots,
  language,
}: {
  cars: Car[];
  prices: CityPrice[];
  cities: { _id: string; name: string }[];
  slots: OccupiedSlot[];
  language: Language;
}) {
  const copy = bookingCopy[language];
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
      return setMessage(copy.form.consentMissing);
    if (!price)
      return setMessage(copy.form.noPrice);
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
        setMessage(copy.form.network);
      }
    });
  }

  if (confirmation)
    return (
      <section className="max-w-xl border border-line p-8">
        <p className="eyebrow">{copy.confirmed.eyebrow}</p>
        <h1 className="section-title mt-4">{copy.confirmed.title}</h1>
        <p className="mt-6">
          {date} · {time} IST · {showroom}
        </p>
        <p className="mt-4 text-sm text-muted">
          {copy.confirmed.text(confirmation.slice(0, 8))}
        </p>
        <Link className="button-primary mt-8" href="/bookings">
          {copy.confirmed.view} ↗
        </Link>
      </section>
    );

  return (
    <>
      <p className="eyebrow">{copy.form.eyebrow}</p>
      <h1 className="section-title mt-4">{copy.form.title}</h1>
      <form
        action={submit}
        className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]"
      >
        <fieldset disabled={pending} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field-label">
              {copy.form.car}
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
              {copy.form.city}
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
            {copy.form.showroom}
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
            {copy.form.date}
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
            <legend className="mb-3 text-sm">{copy.form.slots}</legend>
            {!date && <p className="mb-3 text-xs text-muted">{copy.form.pickDate}</p>}
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
            {copy.form.name}
            <input
              className="field"
              name="buyer"
              required
              maxLength={80}
              placeholder={copy.form.namePlaceholder}
            />
          </label>
          <label className="field-label">
            {copy.form.needs}
            <textarea
              className="field min-h-28"
              name="needs"
              maxLength={1000}
              placeholder={copy.form.needsPlaceholder}
            />
          </label>
          <label className="flex gap-3 text-sm leading-6">
            <input className="mt-1" type="checkbox" name="consent" required />
            {copy.form.consent}
          </label>
          <label className="flex gap-3 text-sm leading-6">
            <input className="mt-1" type="checkbox" name="aiConsent" />
            {copy.form.aiConsent}
          </label>
          <button
            disabled={
              !time || !price || price.validThrough < indiaDate() || pending
            }
            className="button-primary disabled:opacity-40"
          >
            {pending ? copy.form.submitting : copy.form.submit}
          </button>
          <p role="alert" className="text-sm text-red-700">
            {message}
          </p>
        </fieldset>
        <aside className="self-start bg-surface p-8">
          <p className="eyebrow">{copy.snapshot.eyebrow}</p>
          <p className="mt-4 text-3xl">
            {price
              ? formatPrice(calculateOnRoadPrice(price) / 100)
              : copy.snapshot.unavailable}
          </p>
          <p className="mt-4 text-sm leading-6 text-muted">
            {copy.snapshot.text(
              cities.find((item) => item._id === city)?.name ?? city,
              price?.validThrough ?? "—",
            )}
          </p>
          <p className="mt-6 text-xs leading-5">{copy.snapshot.note}</p>
        </aside>
      </form>
    </>
  );
}
