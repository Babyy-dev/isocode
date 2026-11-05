import type { Car } from "@/features/cars/types";
import type { PriceVersion } from "@/features/pricing/types";

export type CarDocument = Omit<Car, "priceInRupees" | "priceLabel"> & {
  _id: string;
  pricePaise: number;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
};
export type CityDocument = { _id: string; name: string };
export type CityPriceDocument = PriceVersion & {
  _id: string;
  carId: string;
  cityId: string;
  createdAt: Date;
  createdBy?: string;
};
