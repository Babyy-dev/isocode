import "server-only";
import { MongoServerError, type ClientSession, type Db } from "mongodb";
import { connectMongo, databaseName } from "@/lib/mongodb/client";
import type { CarDocument, CityPriceDocument } from "@/lib/mongodb/documents";
import { createPriceQuote } from "@/features/pricing/calculate-price";
import { assignConsultant } from "@/features/leads/assignment";
import { BookingError, validateBooking } from "./validation";
import type { BookingDocument, BookingInput } from "./types";
import { matchesRequest } from "./rules";
import { acknowledgementMessage } from "@/features/messaging/templates";

export async function createBooking(
  input: BookingInput,
  buyerId: string,
  buyerEmail: string,
) {
  validateBooking(input);
  const client = await connectMongo();
  const database = client.db(databaseName());
  const session = client.startSession();
  try {
    return await session.withTransaction(
      async () => {
        const existing = await database
          .collection<BookingDocument>("bookings")
          .findOne({ _id: input.requestId }, { session });
        if (existing) {
          if (existing.buyerId !== buyerId)
            throw new BookingError("Reload the form and try again.");
          if (!matchesRequest(existing, input))
            throw new BookingError(
              "A previous request already reserved a different booking. Check My bookings before trying again.",
            );
          return existing._id;
        }
        return reserveBooking(database, session, input, buyerId, buyerEmail);
      },
      { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } },
    );
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      const existing = await database
        .collection<BookingDocument>("bookings")
        .findOne({ _id: input.requestId, buyerId });
      if (existing && matchesRequest(existing, input)) return existing._id;
      throw new BookingError(
        "This slot was just reserved. Refresh the slots and choose another.",
      );
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

async function reserveBooking(
  database: Db,
  session: ClientSession,
  input: BookingInput,
  buyerId: string,
  buyerEmail: string,
) {
  validateBooking(input);
  const car = await lockAndCheckSlot(database, session, input);
  const price = await currentPrice(database, session, input);
  const consultant = await chooseConsultant(database, session, input);
  const booking = makeBooking(input, buyerId, buyerEmail, consultant, price);
  booking.messages.push(
    acknowledgementMessage(
      { ...input, carName: `${car.model} ${car.variant}`, consultant },
      booking.createdAt,
    ),
  );
  await database
    .collection<BookingDocument>("bookings")
    .insertOne(booking, { session });
  return input.requestId;
}

async function lockAndCheckSlot(
  database: Db,
  session: ClientSession,
  input: BookingInput,
) {
  // Serializes assignment within a showroom; transaction retries see the latest workload.
  await database
    .collection<{ _id: string; revision: number }>("bookingLocks")
    .updateOne(
      { _id: input.showroom },
      { $inc: { revision: 1 } },
      { session, upsert: true },
    );
  const occupied = await database
    .collection<BookingDocument>("bookings")
    .findOne(
      {
        carId: input.carId,
        showroom: input.showroom,
        date: input.date,
        time: input.time,
        status: "Confirmed",
      },
      { session },
    );
  if (occupied)
    throw new BookingError("This slot was just reserved. Choose another.");
  const car = await database
    .collection<CarDocument>("cars")
    .findOneAndUpdate(
      { stockId: input.carId, status: "Available", archived: { $ne: true } },
      { $set: { updatedAt: new Date() } },
      { session, returnDocument: "after" },
    );
  if (!car) throw new BookingError("This car is no longer available.");
  return car;
}

async function currentPrice(
  database: Db,
  session: ClientSession,
  input: BookingInput,
) {
  const price = await database
    .collection<CityPriceDocument>("cityPrices")
    .findOne(
      {
        carId: input.carId,
        cityId: input.cityId,
        validFrom: { $lte: new Date() },
      },
      { session, sort: { version: -1 } },
    );
  if (createPriceQuote(price, new Date()).status !== "available" || !price)
    throw new BookingError(
      "The city price is unavailable or expired. Ask for an updated price.",
    );
  if (price.version !== input.priceVersion)
    throw new BookingError(
      "The price changed. Reload and review the new price before booking.",
    );
  return price;
}

async function chooseConsultant(
  database: Db,
  session: ClientSession,
  input: BookingInput,
) {
  const leads = await database
    .collection<BookingDocument>("bookings")
    .find(
      {
        showroom: input.showroom,
        status: "Confirmed",
        leadStatus: { $nin: ["Won", "Lost"] },
      },
      { session },
    )
    .toArray();
  const consultant = assignConsultant(leads, input.showroom, input.carId);
  if (!consultant)
    throw new BookingError("No consultant is configured for this showroom.");
  return consultant;
}

function makeBooking(
  input: BookingInput,
  buyerId: string,
  buyerEmail: string,
  consultant: string,
  price: CityPriceDocument,
): BookingDocument {
  const now = Date.now();
  return {
    _id: input.requestId,
    buyerId,
    buyerEmail,
    carId: input.carId,
    showroom: input.showroom,
    date: input.date,
    time: input.time,
    buyer: input.buyer.trim(),
    needs: input.needs.trim(),
    status: "Confirmed",
    consultant,
    createdAt: now,
    contactedAt: null,
    leadStatus: "New",
    optedOut: false,
    aiConsent: input.aiConsent === true,
    aiConsentAt: input.aiConsent === true ? now : null,
    consentAt: now,
    consentVersion: "booking-follow-up-v1",
    price: {
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
    },
    messages: [],
  };
}
