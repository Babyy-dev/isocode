import "server-only";
import { getDatabase } from "@/lib/database";
import type { CityPriceDocument } from "@/lib/mongodb/documents";
import type { CityPrice, PriceInput } from "./types";
import { validatePriceInput } from "./validate-price";
import { MongoServerError } from "mongodb";

export async function listCityPrices(
  carId?: string,
  effectiveOnly = false,
): Promise<CityPrice[]> {
  const database = await getDatabase();
  const documents = await database
    .collection<CityPriceDocument>("cityPrices")
    .find({
      ...(carId ? { carId } : {}),
      ...(effectiveOnly ? { validFrom: { $lte: new Date() } } : {}),
    })
    .sort({ version: -1 })
    .toArray();
  const latest = new Map<string, CityPrice>();
  for (const price of documents) {
    const key = `${price.carId}:${price.cityId}`;
    if (latest.has(key)) continue;
    latest.set(key, {
      carId: price.carId,
      cityId: price.cityId,
      version: price.version,
      basePricePaise: price.basePricePaise,
      roadTaxPaise: price.roadTaxPaise,
      insurancePaise: price.insurancePaise,
      accessoriesPaise: price.accessoriesPaise,
      validThrough: new Date(+price.validUntil - 1 + 19800000)
        .toISOString()
        .slice(0, 10),
    });
  }
  return [...latest.values()];
}

export class PriceConflict extends Error {}

export async function publishPrice(input: PriceInput, actorId: string) {
  const now = new Date();
  const validUntil = validatePriceInput(input, now);
  const database = await getDatabase();
  const [car, city, latest] = await Promise.all([
    database.collection("cars").findOne({ stockId: input.carId }),
    database
      .collection<{ _id: string }>("cities")
      .findOne({ _id: input.cityId }),
    database
      .collection<CityPriceDocument>("cityPrices")
      .findOne(
        { carId: input.carId, cityId: input.cityId },
        { sort: { version: -1 } },
      ),
  ]);
  if (!car || !city)
    throw new PriceConflict(
      "This car or city no longer exists. Reload the page.",
    );
  if ((latest?.version ?? 0) !== input.version)
    throw new PriceConflict(
      "Another admin changed this price. Reload to review it before saving.",
    );
  const version = input.version + 1;
  const id = `${input.carId}:${input.cityId}:${version}`;
  try {
    await database.collection<CityPriceDocument>("cityPrices").insertOne({
      _id: id,
      id,
      carId: input.carId,
      cityId: input.cityId,
      version,
      basePricePaise: input.basePricePaise,
      roadTaxPaise: input.roadTaxPaise,
      insurancePaise: input.insurancePaise,
      accessoriesPaise: input.accessoriesPaise,
      validFrom: now,
      validUntil,
      createdAt: now,
      createdBy: actorId,
    });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000)
      throw new PriceConflict(
        "Another admin saved first. Reload and review the latest price.",
      );
    throw error;
  }
}

export async function findEffectivePrice(
  carId: string,
  cityId: string,
  now: Date,
) {
  const database = await getDatabase();
  return database
    .collection<CityPriceDocument>("cityPrices")
    .findOne(
      { carId, cityId, validFrom: { $lte: now } },
      { sort: { validFrom: -1, version: -1 } },
    );
}
