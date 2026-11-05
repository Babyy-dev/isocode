import "server-only";
import { MongoServerError } from "mongodb";
import { getDatabase } from "@/lib/database";
import type { CarDocument } from "@/lib/mongodb/documents";
import { carPath } from "@/features/cars/presentation";
import { toCar } from "@/features/cars/repository";
import { CarInputError, validateCar, type CarInput } from "./car-validation";

export async function saveCarRecord(
  input: CarInput,
  create: boolean,
  actorId: string,
) {
  const fields = validateCar(input);
  const database = await getDatabase();
  const cars = database.collection<CarDocument>("cars");
  const now = new Date();
  if (create) {
    const slug = `${fields.model}-${fields.variant}-${fields.stockId}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    try {
      await cars.insertOne({
        ...fields,
        _id: fields.stockId,
        slug,
        archived: false,
        contentVersion: 1,
        createdAt: now,
        updatedAt: now,
        updatedBy: actorId,
      });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000)
        throw new CarInputError(
          "This stock ID or page address already exists.",
        );
      throw error;
    }
    return;
  }
  const existing = await cars.findOne({ stockId: fields.stockId });
  if (!existing || existing.type !== fields.type)
    throw new CarInputError(
      "Car not found or its type changed. Reload the editor.",
    );
  const result = await cars.updateOne(
    { stockId: fields.stockId, ...versionFilter(input.expectedVersion) },
    {
      $set: {
        ...fields,
        slug: existing.slug ?? carPath(toCar(existing)).slice(6),
        updatedAt: now,
        updatedBy: actorId,
      },
      $inc: { contentVersion: 1 },
    },
  );
  if (!result.matchedCount)
    throw new CarInputError(
      "Another admin changed this car. Reload before saving.",
    );
}

export function versionFilter(version: number) {
  return version === 0
    ? { $or: [{ contentVersion: 0 }, { contentVersion: { $exists: false } }] }
    : { contentVersion: version };
}

export async function archiveCarRecord(
  stockId: string,
  archived: boolean,
  version: number,
) {
  const database = await getDatabase();
  const result = await database
    .collection<CarDocument>("cars")
    .updateOne(
      { stockId, ...versionFilter(version) },
      {
        $set: { archived, updatedAt: new Date() },
        $inc: { contentVersion: 1 },
      },
    );
  if (!result.matchedCount)
    throw new CarInputError("Car changed. Reload before trying again.");
}
