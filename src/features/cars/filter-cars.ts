import type { Car } from "./types";

export type CarFilters = {
  type: "All" | Car["type"];
  search: string;
  fuel: "All" | Car["fuel"];
  availableOnly: boolean;
  sort: "recommended" | "price-low" | "price-high";
};

export function filterCars(cars: readonly Car[], filters: CarFilters): Car[] {
  const search = filters.search.trim().toLowerCase();
  const result = cars.filter(
    (car) =>
      (filters.type === "All" || car.type === filters.type) &&
      (filters.fuel === "All" || car.fuel === filters.fuel) &&
      (!filters.availableOnly || car.status === "Available") &&
      `${car.model} ${car.variant}`.toLowerCase().includes(search),
  );

  if (filters.sort === "price-low")
    result.sort((a, b) => a.priceInRupees - b.priceInRupees);
  if (filters.sort === "price-high")
    result.sort((a, b) => b.priceInRupees - a.priceInRupees);

  return result;
}
