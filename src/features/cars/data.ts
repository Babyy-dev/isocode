import type { Car } from "./types";

// Exact stock values from info.md. These are sample records, not live inventory.
export const sampleCars = [
  {
    stockId: "NEW-H-02",
    type: "New",
    model: "Model H",
    variant: "ZX automatic",
    fuel: "Petrol",
    year: 2026,
    kilometres: 0,
    priceInRupees: 1245000,
    priceLabel: "Ex-showroom price",
    status: "Available",
  },
  {
    stockId: "UC-1182",
    type: "Used",
    model: "Model C",
    variant: "VX",
    fuel: "Diesel",
    year: 2022,
    kilometres: 41200,
    priceInRupees: 845000,
    priceLabel: "Listed price",
    status: "Available",
  },
  {
    stockId: "UC-1190",
    type: "Used",
    model: "Model S",
    variant: "LX",
    fuel: "Petrol",
    year: 2021,
    kilometres: 58600,
    priceInRupees: 512000,
    priceLabel: "Listed price",
    status: "Booked",
  },
] as const satisfies readonly Car[];
