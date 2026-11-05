import { syntheticCarContent } from "../src/features/cars/seed-content";
import { sampleCars } from "../src/features/cars/data";
import { demoPrices, demoCities } from "../src/features/demo/data";
import { endOfIndiaDate } from "../src/features/pricing/validate-price";
import type {
  CityPriceDocument,
  CarDocument,
  CityDocument,
} from "../src/lib/mongodb/documents";
import { runDatabaseTask } from "./database-task";

void runDatabaseTask(async (database) => {
  const now = new Date();
  for (const car of sampleCars) {
    const record: CarDocument = {
      _id: car.stockId,
      stockId: car.stockId,
      type: car.type,
      model: car.model,
      variant: car.variant,
      fuel: car.fuel,
      year: car.year,
      kilometres: car.kilometres,
      pricePaise: car.priceInRupees * 100,
      status: car.status,
      createdAt: now,
      updatedAt: now,
    };
    await database
      .collection<CarDocument>("cars")
      .updateOne(
        { _id: record._id },
        { $setOnInsert: record },
        { upsert: true },
      );
    const content = syntheticCarContent(car);
    for (const [key, value] of Object.entries(content)) {
      await database
        .collection<CarDocument>("cars")
        .updateOne(
          { _id: car.stockId, [key]: { $exists: false } },
          { $set: { [key]: value } },
        );
    }
  }
  for (const name of demoCities) {
    await database
      .collection<CityDocument>("cities")
      .updateOne(
        { _id: name.toLowerCase() },
        { $setOnInsert: { _id: name.toLowerCase(), name } },
        { upsert: true },
      );
  }
  for (const price of demoPrices) {
    const cityId = price.city.toLowerCase();
    const collection = database.collection<CityPriceDocument>("cityPrices");
    if (await collection.findOne({ carId: price.carId, cityId })) continue;
    const id = `${price.carId}:${cityId}:1`;
    await collection.updateOne(
      { _id: id },
      {
        $setOnInsert: {
          _id: id,
          id,
          carId: price.carId,
          cityId,
          version: 1,
          basePricePaise: price.base * 100,
          roadTaxPaise: price.tax * 100,
          insurancePaise: price.insurance * 100,
          accessoriesPaise: price.accessories * 100,
          validFrom: new Date("2026-01-01T00:00:00+05:30"),
          validUntil: endOfIndiaDate(price.validUntil),
          createdAt: now,
          createdBy: "synthetic-seed",
        },
      },
      { upsert: true },
    );
  }
  console.info(
    "Seed complete. Existing records preserved; synthetic city price tables seeded where missing.",
  );
});
