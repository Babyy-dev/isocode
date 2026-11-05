import type { Db } from "mongodb";

/** Idempotent data migrations; each one only touches records still in the old shape. */
export async function runMigrations(database: Db) {
  const cars = await dropFreeTextInspections(database);
  return { cars };
}

/** The free-text inspectionReport field was replaced by the structured `inspection` checklist. */
async function dropFreeTextInspections(database: Db) {
  const result = await database
    .collection("cars")
    .updateMany({ inspectionReport: { $exists: true } }, { $unset: { inspectionReport: "" } });
  return result.modifiedCount;
}
