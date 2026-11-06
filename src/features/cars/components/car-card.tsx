import Link from "next/link";
import { CarImage } from "./car-image";
import { carCopy } from "../copy";
import { carPath, formatKilometres, formatPrice } from "../presentation";
import type { Language } from "@/lib/i18n/language";
import type { Car } from "../types";

export function CarCard({ car, language }: { car: Car; language: Language }) {
  const copy = carCopy[language];

  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-page shadow-card transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-hover">
      <Link
        href={carPath(car)}
        className="relative block aspect-[4/3] overflow-hidden bg-surface"
        aria-label={`${copy.viewDetails}: ${car.model} ${car.variant}`}
      >
        <CarImage
          car={car}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className="absolute top-4 left-4 rounded-full border border-line/60 bg-page/85 px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm">
          {car.type === "New" ? copy.newCars : copy.usedCars}
        </span>
        <span className="absolute right-3 bottom-3 rounded-full bg-black/55 px-2.5 py-1 text-[9px] text-white backdrop-blur-sm">
          {copy.imageNote}
        </span>
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-2xl font-medium tracking-tight">{car.model}</h3>
          <span
            className={`text-xs ${car.status === "Available" ? "text-accent" : "text-muted"}`}
          >
            {car.status === "Available" ? copy.available : copy.booked}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">{car.variant}</p>
        <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          <span>{car.year}</span>
          <span aria-hidden>·</span>
          <span>{copy[car.fuel]}</span>
          <span aria-hidden>·</span>
          <span>
            {formatKilometres(car.kilometres)} {copy.km}
          </span>
        </p>
        <div className="mt-6 flex items-end justify-between gap-3 border-t border-line pt-5">
          <div>
            <p className="text-[11px] text-muted">
              {car.type === "New" ? copy.exShowroom : copy.listedPrice}
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {formatPrice(car.priceInRupees)}
            </p>
          </div>
          <Link
            className="text-sm font-semibold text-accent hover:underline"
            href={carPath(car)}
          >
            {copy.viewDetails} <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
