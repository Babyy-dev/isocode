import Link from "next/link";
import { CarImage } from "./car-image";
import { carCopy } from "../copy";
import { carPath, formatPrice, type Language } from "../presentation";
import type { Car } from "../types";

export function CatalogueHero({
  car,
  language,
}: {
  car: Car;
  language: Language;
}) {
  const copy = carCopy[language];

  return (
    <section className="page-container grid gap-8 pb-12 pt-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:py-16">
      <div className="flex flex-col justify-center py-4">
        <p className="eyebrow">{copy.heroLabel}</p>
        <h1 className="mt-6 text-[clamp(2.7rem,5vw,4.5rem)] leading-[1.08] font-medium tracking-[-0.055em]">
          {copy.heroTitle}
          <br />
          <span className="text-accent">{copy.heroAccent}</span>
        </h1>
        <p className="mt-6 max-w-md text-base leading-7 text-muted">
          {copy.heroDescription}
        </p>
        <a href="#collection" className="button-primary mt-8 self-start">
          {copy.browse}
          <span aria-hidden>↗</span>
        </a>
        <p className="mt-9 flex items-center gap-2 text-xs text-muted">
          <span className="size-1.5 rounded-full bg-accent" />
          {copy.location}
        </p>
      </div>
      <div className="group relative isolate min-h-[380px] overflow-hidden rounded-sm bg-surface sm:min-h-[480px]">
        <CarImage car={car} priority sizes="(max-width: 1024px) 100vw, 55vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
        <span className="absolute top-6 left-6 border border-white/50 bg-black/15 px-3 py-2 text-[10px] tracking-[0.2em] text-white">
          {copy.featured}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
          <p className="text-xs text-white/75">
            {car.variant} · {copy[car.fuel]}
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl tracking-tight">{car.model}</h2>
              <p className="mt-3 text-lg">
                {formatPrice(car.priceInRupees)}{" "}
                <span className="text-xs text-white/75">{copy.exShowroom}</span>
              </p>
            </div>
            <Link
              href={carPath(car, language)}
              aria-label={copy.viewCar}
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/60 text-xl transition-colors hover:bg-white hover:text-ink"
            >
              ↗
            </Link>
          </div>
          <p className="mt-5 text-[10px] text-white/65">{copy.imageNote}</p>
        </div>
      </div>
    </section>
  );
}

export function ShowroomHighlights({ language }: { language: Language }) {
  const copy = carCopy[language];
  const highlights = [
    [copy.showroomCount, copy.showroomDescription],
    [copy.newAndUsed, copy.newAndUsedDescription],
    [copy.clearPrices, copy.clearPricesDescription],
  ];

  return (
    <div className="border-y border-line bg-surface/60">
      <div className="page-container grid gap-6 py-7 sm:grid-cols-3">
        {highlights.map(([title, description], index) => (
          <div key={title} className="flex gap-4">
            <span className="pt-1 text-xs text-muted/70">0{index + 1}</span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-1 text-xs text-muted">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
