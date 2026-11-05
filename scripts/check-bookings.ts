import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { Db } from "mongodb";
import { runDatabaseTask } from "./database-task";
import { setupDatabase } from "./database-schema";
import { sampleCars } from "../src/features/cars/data";
import { createBooking } from "../src/features/bookings/create-booking";
import { updateOwnedBooking } from "../src/features/bookings/mutations";
import { buyerBookings } from "../src/features/bookings/queries";
import {
  consumeBookingAttempt,
  BOOKING_WINDOW_MS,
} from "../src/features/bookings/rate-limit";
import type {
  BookingDocument,
  BookingInput,
} from "../src/features/bookings/types";
import { updateLead } from "../src/features/leads/mutations";
import type {
  CarDocument,
  CityPriceDocument,
  CityDocument,
} from "../src/lib/mongodb/documents";

// Never use or drop the configured application database.
const checkDatabase = `showroom_checks_${randomUUID().replaceAll("-", "")}`;
process.env.MONGODB_DB_NAME = checkDatabase;

void runDatabaseTask(async (database) => {
  assert.equal(database.databaseName, checkDatabase);
  try {
    await setupDatabase(database);
    await seedFixture(database);
    await checkReservations(database);
    await checkRateLimit();
    console.info(
      "Booking integration checks passed: contention, idempotency, ownership, opt-out, assignment scope, snapshot, cancellation and rate limits.",
    );
  } finally {
    await database.dropDatabase();
    console.info("Temporary integration database removed.");
  }
});

function input(): BookingInput {
  return {
    requestId: randomUUID(),
    carId: "NEW-H-02",
    cityId: "lucknow",
    priceVersion: 1,
    showroom: "Demo Showroom 1",
    date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    time: "10:00",
    buyer: "Synthetic Buyer",
    needs: "Automatic",
    consent: true,
  };
}

async function seedFixture(database: Db) {
  const car = sampleCars[0];
  await database
    .collection<CarDocument>("cars")
    .insertOne({
      ...car,
      _id: car.stockId,
      pricePaise: car.priceInRupees * 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  await database
    .collection<CityDocument>("cities")
    .insertOne({ _id: "lucknow", name: "Lucknow" });
  await database.collection<CityPriceDocument>("cityPrices").insertOne({
    _id: "price-1",
    id: "price-1",
    carId: car.stockId,
    cityId: "lucknow",
    version: 1,
    basePricePaise: car.priceInRupees * 100,
    roadTaxPaise: 9500000,
    insurancePaise: 3800000,
    accessoriesPaise: 0,
    validFrom: new Date(Date.now() - 60000),
    validUntil: new Date(Date.now() + 30 * 86400000),
    createdAt: new Date(),
  });
}

async function checkReservations(database: Db) {
  const first = input();
  const attempts = [first, { ...first, requestId: randomUUID() }];
  const results = await Promise.allSettled(
    attempts.map((request) =>
      createBooking(request, "buyer-a", "buyer-a@example.invalid"),
    ),
  );
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(await database.collection("bookings").countDocuments(), 1);
  const winningInput =
    attempts[results.findIndex((result) => result.status === "fulfilled")];
  assert.equal(
    await createBooking(winningInput, "buyer-a", "buyer-a@example.invalid"),
    winningInput.requestId,
  );
  assert.equal((await buyerBookings("buyer-b")).length, 0);
  assert.equal(
    await updateOwnedBooking("buyer-b", winningInput.requestId, "cancel"),
    false,
  );
  await checkLeadAccess(winningInput.requestId);
  await checkPriceSnapshot(database, winningInput.requestId);
  assert.equal(
    await updateOwnedBooking("buyer-a", winningInput.requestId, "cancel"),
    true,
  );
  await createBooking(
    { ...first, requestId: randomUUID(), priceVersion: 2 },
    "buyer-b",
    "buyer-b@example.invalid",
  );
  assert.equal(
    await database
      .collection("bookings")
      .countDocuments({ status: "Confirmed" }),
    1,
  );
}

async function checkLeadAccess(id: string) {
  const admin = { userId: "admin", role: "admin" as const, profile: null };
  const wrongConsultant = {
    userId: "c2",
    role: "consultant" as const,
    profile: "Consultant 2A",
  };
  assert.ok((await updateLead(wrongConsultant, id, { kind: "contact" })).error);
  await updateOwnedBooking("buyer-a", id, "opt-out");
  assert.ok(
    (
      await updateLead(admin, id, {
        kind: "reply",
        value: "Hello",
        reviewed: true,
      })
    ).error,
  );
  await updateOwnedBooking("buyer-a", id, "opt-in");
  assert.equal(
    (
      await updateLead(admin, id, {
        kind: "reply",
        value: "Hello",
        reviewed: true,
      })
    ).error,
    null,
  );
  assert.equal((await updateLead(admin, id, { kind: "contact" })).error, null);
  assert.ok((await updateLead(admin, id, { kind: "contact" })).error);
}

async function checkPriceSnapshot(database: Db, id: string) {
  const prices = database.collection<CityPriceDocument>("cityPrices");
  const old = (await prices.findOne({ _id: "price-1" }))!;
  await prices.insertOne({
    ...old,
    _id: "price-2",
    id: "price-2",
    version: 2,
    basePricePaise: old.basePricePaise + 100,
  });
  const saved = await database
    .collection<BookingDocument>("bookings")
    .findOne({ _id: id });
  assert.equal(saved?.price.basePricePaise, old.basePricePaise);
  await assert.rejects(
    () =>
      createBooking(
        { ...input(), time: "11:00" },
        "buyer-b",
        "buyer-b@example.invalid",
      ),
    /price changed/,
  );
}

async function checkRateLimit() {
  const now = Date.now();
  const results = await Promise.allSettled(
    Array.from({ length: 10 }, () =>
      consumeBookingAttempt("limited-user", now),
    ),
  );
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    5,
  );
  await consumeBookingAttempt("different-user", now);
  await consumeBookingAttempt("limited-user", now + BOOKING_WINDOW_MS);
}
