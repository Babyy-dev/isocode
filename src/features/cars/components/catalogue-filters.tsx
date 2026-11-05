import type { CarCopy } from "../copy";
import type { CarFilters } from "../filter-cars";

type CatalogueFiltersProps = {
  filters: CarFilters;
  copy: CarCopy;
  onChange: (patch: Partial<CarFilters>) => void;
};

export function CatalogueFilters({
  filters,
  copy,
  onChange,
}: CatalogueFiltersProps) {
  return (
    <div className="my-7 grid gap-4 rounded-sm border border-line bg-white p-5 md:grid-cols-[2fr_1fr_1fr]">
      <label className="field-label">
        {copy.search}
        <input
          className="field"
          type="search"
          placeholder={copy.searchPlaceholder}
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </label>
      <label className="field-label">
        {copy.fuel}
        <select
          className="field"
          value={filters.fuel}
          onChange={(event) =>
            onChange({ fuel: event.target.value as CarFilters["fuel"] })
          }
        >
          <option value="All">{copy.allFuels}</option>
          <option value="Petrol">{copy.Petrol}</option>
          <option value="Diesel">{copy.Diesel}</option>
        </select>
      </label>
      <label className="field-label">
        {copy.sort}
        <select
          className="field"
          value={filters.sort}
          onChange={(event) =>
            onChange({ sort: event.target.value as CarFilters["sort"] })
          }
        >
          <option value="recommended">{copy.recommended}</option>
          <option value="price-low">{copy.lowPrice}</option>
          <option value="price-high">{copy.highPrice}</option>
        </select>
      </label>
    </div>
  );
}

export function CatalogueTabs({
  type: selectedType,
  copy,
  onChange,
}: {
  type: CarFilters["type"];
  copy: CarCopy;
  onChange: (type: CarFilters["type"]) => void;
}) {
  return (
    <div
      className="mt-9 flex flex-wrap gap-2"
      role="group"
      aria-label={copy.type}
    >
      {(["All", "New", "Used"] as const).map((type) => (
        <button
          key={type}
          type="button"
          aria-pressed={selectedType === type}
          onClick={() => onChange(type)}
          className={`min-h-11 rounded-sm px-6 py-3 text-sm font-medium transition-colors ${selectedType === type ? "bg-ink text-white" : "bg-surface text-muted hover:bg-line"}`}
        >
          {type === "All"
            ? copy.allCars
            : type === "New"
              ? copy.newCars
              : copy.usedCars}
        </button>
      ))}
    </div>
  );
}

export function CatalogueResultBar({
  count,
  availableOnly,
  copy,
  onChange,
}: {
  count: number;
  availableOnly: boolean;
  copy: CarCopy;
  onChange: (availableOnly: boolean) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-sm">
      <p role="status" className="text-muted">
        <span className="font-semibold text-ink">{count}</span>{" "}
        {count === 1 ? copy.oneResult : copy.results}
      </p>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-muted">
        <input
          type="checkbox"
          className="size-4 accent-accent"
          checked={availableOnly}
          onChange={(event) => onChange(event.target.checked)}
        />
        {copy.availableOnly}
      </label>
    </div>
  );
}
