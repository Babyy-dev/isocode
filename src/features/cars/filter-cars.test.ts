import assert from "node:assert/strict";
import test from "node:test";
import { sampleCars } from "./data";
import { filterCars, type CarFilters } from "./filter-cars";
import { carPath } from "./presentation";

const filters: CarFilters = {
  type: "All",
  search: "",
  fuel: "All",
  availableOnly: false,
  sort: "recommended",
};

test("combines used, fuel, availability and trimmed search filters", () => {
  const result = filterCars(sampleCars, {
    ...filters,
    type: "Used",
    fuel: "Diesel",
    availableOnly: true,
    search: "  vx  ",
  });
  assert.deepEqual(
    result.map((car) => car.stockId),
    ["UC-1182"],
  );
});

test("available-only hides the booked stock without changing the seed", () => {
  assert.equal(
    filterCars(sampleCars, { ...filters, availableOnly: true }).length,
    2,
  );
  assert.equal(filterCars(sampleCars, filters).length, 3);
  assert.equal(sampleCars[2].status, "Booked");
});

test("sorts both price directions without mutating the source", () => {
  const low = filterCars(sampleCars, { ...filters, sort: "price-low" });
  const high = filterCars(sampleCars, { ...filters, sort: "price-high" });
  assert.equal(low[0].stockId, "UC-1190");
  assert.equal(high[0].stockId, "NEW-H-02");
  assert.equal(sampleCars[0].stockId, "NEW-H-02");
});

test("unmatched searches return an empty result", () => {
  assert.deepEqual(
    filterCars(sampleCars, { ...filters, search: "unlisted car" }),
    [],
  );
});

test("each car has a unique readable detail route", () => {
  assert.equal(new Set(sampleCars.map((car) => carPath(car))).size, 3);
  assert.equal(carPath(sampleCars[1], "hi"), "/cars/model-c-vx-2022?lang=hi");
});
