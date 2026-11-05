"use client";

import { useState } from "react";
import { CarCard } from "./car-card";
import {
  CatalogueFilters,
  CatalogueTabs,
  CatalogueResultBar,
} from "./catalogue-filters";
import { carCopy } from "../copy";
import { filterCars, type CarFilters } from "../filter-cars";
import type { Language } from "../presentation";
import type { Car } from "../types";

type CarCatalogueProps = {
  cars: readonly Car[];
  language: Language;
  initialType: CarFilters["type"];
  availableOnly: boolean;
};
const defaultFilters: CarFilters = {
  type: "All",
  search: "",
  fuel: "All",
  availableOnly: false,
  sort: "recommended",
};

export function CarCatalogue({
  cars,
  language,
  initialType,
  availableOnly,
}: CarCatalogueProps) {
  const [filters, setFilters] = useState<CarFilters>({
    ...defaultFilters,
    type: initialType,
    availableOnly,
  });
  const copy = carCopy[language];
  const results = filterCars(cars, filters);
  const updateFilters = (patch: Partial<CarFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  return (
    <section id="collection" className="page-container scroll-mt-6 py-16">
      <p className="eyebrow">{copy.collectionLabel}</p>
      <h2 className="section-title mt-4">{copy.collectionTitle}</h2>
      <p className="mt-4 text-muted">{copy.collectionDescription}</p>
      <CatalogueTabs
        type={filters.type}
        copy={copy}
        onChange={(type) => updateFilters({ type })}
      />
      <CatalogueFilters
        filters={filters}
        copy={copy}
        onChange={updateFilters}
      />
      <CatalogueResultBar
        count={results.length}
        availableOnly={filters.availableOnly}
        copy={copy}
        onChange={(availableOnly) => updateFilters({ availableOnly })}
      />
      {results.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((car) => (
            <CarCard key={car.stockId} car={car} language={language} />
          ))}
        </div>
      ) : (
        <EmptyCatalogue copy={copy} reset={() => setFilters(defaultFilters)} />
      )}
      <p className="mt-6 text-xs leading-5 text-muted">{copy.sampleNote}</p>
    </section>
  );
}

function EmptyCatalogue({
  copy,
  reset,
}: {
  copy: typeof carCopy.en;
  reset: () => void;
}) {
  return (
    <div className="border border-dashed border-line px-6 py-16 text-center">
      <h3 className="text-xl font-medium">{copy.noResults}</h3>
      <p className="mt-3 text-sm text-muted">{copy.noResultsDescription}</p>
      <button className="button-primary mt-6" type="button" onClick={reset}>
        {copy.reset}
      </button>
    </div>
  );
}
