import "server-only";
import { getDatabase } from "@/lib/database";
import type { CarDocument } from "@/lib/mongodb/documents";

export async function listCars(includeArchived = false) {
  const database = await getDatabase();
  return database
    .collection<CarDocument>("cars")
    .find(includeArchived ? {} : { archived: { $ne: true } })
    .sort({ stockId: 1 })
    .toArray();
}

export async function findCarByStockId(stockId: string) {
  const database = await getDatabase();
  return database.collection<CarDocument>("cars").findOne({ stockId });
}

export function toCar(document: CarDocument): import("./types").Car {
  const details = {
    slug: document.slug,
    description: document.description,
    colours: document.colours ?? [],
    specifications: document.specifications ?? [],
    owners: document.owners ?? null,
    registrationMasked: document.registrationMasked ?? "",
    inspection: document.inspection ?? null,
    photoUrls: document.photoUrls ?? [],
    archived: document.archived ?? false,
    contentVersion: document.contentVersion ?? 0,
    stockId: document.stockId,
    model: document.model,
    variant: document.variant,
    fuel: document.fuel,
    year: document.year,
    kilometres: document.kilometres,
    status: document.status,
    priceInRupees: document.pricePaise / 100,
  };
  return document.type === "New"
    ? { ...details, type: "New", priceLabel: "Ex-showroom price" }
    : { ...details, type: "Used", priceLabel: "Listed price" };
}

export async function listCities() {
  const database = await getDatabase();
  return database
    .collection<import("@/lib/mongodb/documents").CityDocument>("cities")
    .find()
    .sort({ name: -1 })
    .toArray();
}
