import "server-only";
import { indiaDate } from "@/lib/date";
import { getDatabase } from "@/lib/database";
import type { CarDocument } from "@/lib/mongodb/documents";
import type { Booking, BookingDocument, OccupiedSlot } from "./types";

export function bookingView(
  record: BookingDocument,
  carNames: Map<string, string>,
  includeAi = false,
): Booking {
  return {
    aiConsent: record.aiConsent ?? false,
    aiConsentAt: record.aiConsentAt ?? null,
    ...(includeAi && record.ai ? { ai: record.ai } : {}),
    id: record._id,
    carId: record.carId,
    carName: carNames.get(record.carId) ?? record.carId,
    showroom: record.showroom,
    date: record.date,
    time: record.time,
    buyer: record.buyer,
    needs: record.needs,
    buyerEmail: record.buyerEmail,
    status: record.status,
    consultant: record.consultant,
    createdAt: record.createdAt,
    contactedAt: record.contactedAt,
    leadStatus: record.leadStatus,
    optedOut: record.optedOut,
    price: record.price,
    messages: record.messages,
  };
}

export async function buyerBookings(buyerId: string) {
  const database = await getDatabase();
  const records = await database
    .collection<BookingDocument>("bookings")
    .find({ buyerId })
    .sort({ createdAt: -1 })
    .toArray();
  const names = await carNamesFor(records);
  return records.map((record) => bookingView(record, names));
}

/** Model and variant for each car referenced by these bookings, in one query. */
export async function carNamesFor(records: Pick<BookingDocument, "carId">[]) {
  const ids = [...new Set(records.map((record) => record.carId))];
  if (!ids.length) return new Map<string, string>();
  const database = await getDatabase();
  const cars = await database
    .collection<CarDocument>("cars")
    .find({ _id: { $in: ids } }, { projection: { model: 1, variant: 1 } })
    .toArray();
  return new Map(cars.map((car) => [car._id, `${car.model} ${car.variant}`]));
}

export async function occupiedSlots(): Promise<OccupiedSlot[]> {
  const database = await getDatabase();
  const records = await database
    .collection<BookingDocument>("bookings")
    .find(
      { status: "Confirmed", date: { $gte: indiaDate() } },
      { projection: { _id: 0, carId: 1, showroom: 1, date: 1, time: 1 } },
    )
    .toArray();
  return records.map(({ carId, showroom, date, time }) => ({
    carId,
    showroom,
    date,
    time,
  }));
}
