import Link from "next/link";
import { CarGallery } from "./car-gallery";
import { CarOverview } from "./car-overview";
import { CarPricePanel } from "./car-price-panel";
import { carCopy } from "../copy";
import { formatPrice, type Language } from "../presentation";
import type { Car } from "../types";

import type { CityPrice } from "@/features/pricing/types";
import { InspectionCard } from "@/features/inspection/components/inspection-card";

export function CarDetail({
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
  const copy = carCopy[language];

  return (
    <main id="main-content" className="page-container py-8">
      <Link
        href={`/?lang=${language}#collection`}
        className="inline-flex min-h-11 items-center gap-2 text-xs text-muted hover:text-accent"
      >
        <span aria-hidden>←</span>
        {copy.back}
      </Link>
      <DetailHeading car={car} language={language} />
      <figure className="mt-8">
        <CarGallery car={car} />
        <figcaption className="mt-3 text-xs text-muted">
          {copy.sampleNote}
        </figcaption>
      </figure>
      <nav
        className="mt-8 flex flex-wrap gap-8 border-b border-line pb-5 text-sm"
        aria-label={copy.overview}
      >
        <a className="text-accent hover:underline" href="#overview">
          {copy.overview}
        </a>
        <a className="hover:text-accent" href="#pricing">
          {copy.pricing}
        </a>
        {car.type === "Used" && (
          <a className="hover:text-accent" href="#inspection">
            {copy.inspection}
          </a>
        )}
      </nav>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.25fr_0.85fr]">
        <div>
          <CarOverview car={car} language={language} />
          {car.type === "Used" && (
            <InspectionCard inspection={car.inspection} language={language} />
          )}
        </div>
        <CarPricePanel
          car={car}
          language={language}
          prices={prices}
          cities={cities}
        />
      </div>
    </main>
  );
}

function DetailHeading({ car, language }: { car: Car; language: Language }) {
  const copy = carCopy[language];

  return (
    <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <p className="eyebrow">
          BRAND X · {car.type === "New" ? copy.newCars : copy.usedCars}
        </p>
        <h1 className="mt-3 text-5xl font-medium tracking-[-0.05em] sm:text-6xl">
          {car.model}
        </h1>
        <p className="mt-3 text-muted">
          {car.variant} <span className="mx-2">·</span> {car.year}{" "}
          <span className="mx-2">·</span> {copy[car.fuel]}
        </p>
        <p className="mt-4 text-xs font-medium text-accent">
          {car.status === "Available" ? copy.available : copy.booked}
        </p>
      </div>
      <div className="md:text-right">
        <p className="text-xs text-muted">
          {car.type === "New" ? copy.exShowroom : copy.listedPrice}
        </p>
        <p className="mt-2 text-3xl font-medium tracking-tight">
          {formatPrice(car.priceInRupees)}
        </p>
        <a
          className="mt-3 inline-flex min-h-11 items-center gap-3 text-sm text-accent hover:underline"
          href="#pricing"
        >
          {copy.checkPrice}
          <span aria-hidden>↓</span>
        </a>
      </div>
    </div>
  );
}
