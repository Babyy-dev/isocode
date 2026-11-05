import { sampleCars } from "@/features/cars/data";
import type { DemoPrice } from "./types";

export const demoCities = ["Lucknow", "Kanpur"];
export const demoShowrooms = [
  "Demo Showroom 1",
  "Demo Showroom 2",
  "Demo Showroom 3",
];
export const demoTimes = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
];

export const demoConsultants = demoShowrooms.flatMap((showroom, index) => [
  {
    name: `Consultant ${index + 1}A`,
    showroom,
    models: ["NEW-H-02", "UC-1182", "UC-1190"],
  },
  { name: `Consultant ${index + 1}B`, showroom, models: ["NEW-H-02"] },
  { name: `Lead desk ${index + 1}`, showroom, models: [] },
]);

export const demoPrices: DemoPrice[] = sampleCars.flatMap((car) =>
  demoCities.map((city, index) => ({
    carId: car.stockId,
    city,
    base: car.priceInRupees,
    tax: car.type === "New" ? 95000 + index * 5000 : 3500 + index * 500,
    insurance: car.type === "New" ? 38000 : 18000,
    accessories: 0,
    validUntil: "2027-03-31",
  })),
);
