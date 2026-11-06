"use client";

import Link from "next/link";
import { useState } from "react";
import { indiaDate } from "@/lib/date";
import { calculateOnRoadPrice } from "@/features/pricing/calculate-price";
import type { CityPrice } from "@/features/pricing/types";
import { carCopy } from "../copy";
import { formatPrice } from "../presentation";
import type { Language } from "@/lib/i18n/language";
import type { Car } from "../types";

export function CarPricePanel({
  car,
  language,
  prices,
  cities,
}: {
  car: Car;
  language: Language;
  prices: CityPrice[];
  cities: { _id: string; name: string }[];
}) {
  const [city, setCity] = useState("lucknow");
  const copy = carCopy[language];
  const price = prices.find((row) => row.cityId === city);
  const booked = car.status === "Booked";
  const expired = price ? price.validThrough < indiaDate() : false;
  const labels =
    language === "hi"
      ? {
          city: "शहर",
          demo: "नमूना कीमतें · वास्तविक कोट नहीं",
          book: "टेस्ट ड्राइव बुक करें",
          expired: "कीमत की वैधता समाप्त",
        }
      : {
          city: "Price city",
          demo: "Illustrative demo prices · Not a real quote",
          book: "Book a test drive",
          expired: "Price expired",
        };
  const rows = price
    ? ([
        [
          car.type === "New" ? copy.exShowroom : copy.listedPrice,
          price.basePricePaise / 100,
        ],
        [copy.roadTax, price.roadTaxPaise / 100],
        [copy.insurance, price.insurancePaise / 100],
        [copy.accessories, price.accessoriesPaise / 100],
      ] as const)
    : [];

  return (
    <aside
      id="pricing"
      className="scroll-mt-8 self-start border border-line p-7 lg:sticky lg:top-8"
    >
      <p className="eyebrow">{labels.demo}</p>
      <h2 className="mt-4 text-2xl font-medium">{copy.priceTitle}</h2>
      <label className="field-label mt-6">
        {labels.city}
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
      <dl className="mt-6 space-y-5 text-sm">
        {rows.map(([label, amount]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted">{label}</dt>
            <dd>{formatPrice(amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 border-t border-line pt-5">
          <dt>{copy.onRoad}</dt>
          <dd className="font-semibold">
            {!price
              ? copy.unavailable
              : expired
                ? labels.expired
                : formatPrice(calculateOnRoadPrice(price) / 100)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 text-xs text-muted">
          <dt>{copy.validity}</dt>
          <dd>{price?.validThrough ?? "—"}</dd>
        </div>
      </dl>
      <p className="mt-6 text-xs leading-6 text-muted">
        {copy.priceDisclaimer}
      </p>
      <p className="mt-3 text-xs text-muted">{labels.demo}.</p>
      {!booked && !expired && price ? (
        <Link href="/book" className="button-primary mt-7">
          {labels.book} ↗
        </Link>
      ) : (
        <p className="mt-7 text-sm">
          {booked
            ? copy.bookedExplanation
            : !price
              ? copy.unavailable
              : labels.expired}
        </p>
      )}
    </aside>
  );
}
