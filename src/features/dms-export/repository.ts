import "server-only";
import { getDatabase } from "@/lib/database";
import { carNamesFor } from "@/features/bookings/queries";
import type { BookingDocument } from "@/features/bookings/types";
import { indiaDayRange, type ExportBooking } from "./columns";

/** Every booking created on one India calendar day, oldest first, with car names. */
export async function bookingsCreatedOn(date: string): Promise<ExportBooking[]> {
  const { start, end } = indiaDayRange(date);
  const database = await getDatabase();
  const records = await database
    .collection<BookingDocument>("bookings")
    .find({ createdAt: { $gte: start, $lt: end } })
    .sort({ createdAt: 1 })
    .toArray();
  const names = await carNamesFor(records);
  return records.map((record) => ({ ...record, carName: names.get(record.carId) ?? record.carId }));
}
