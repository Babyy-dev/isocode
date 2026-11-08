import { calculateOnRoadPrice } from "@/features/pricing/calculate-price";
import type { BookingDocument } from "@/features/bookings/types";
import type { CsvCell } from "./csv";

export type ExportBooking = BookingDocument & { carName: string };

type Column = { header: string; value: (booking: ExportBooking) => CsvCell };

const rupees = (paise: number) => paise / 100;

/**
 * One row per test-drive lead, in a fixed order the dealership can map once in its DMS import.
 * Only what the DMS needs: no free-text needs, AI output or message bodies (data minimisation).
 */
export const dmsColumns: Column[] = [
  { header: "booking_id", value: (b) => b._id },
  { header: "created_at_ist", value: (b) => istDateTime(b.createdAt) },
  { header: "showroom", value: (b) => b.showroom },
  { header: "consultant", value: (b) => b.consultant },
  { header: "stock_id", value: (b) => b.carId },
  { header: "car", value: (b) => b.carName },
  { header: "test_drive_date", value: (b) => b.date },
  { header: "test_drive_time_ist", value: (b) => b.time },
  { header: "booking_status", value: (b) => b.status },
  { header: "lead_status", value: (b) => b.leadStatus },
  { header: "first_contact_ist", value: (b) => (b.contactedAt ? istDateTime(b.contactedAt) : null) },
  { header: "response_minutes", value: (b) => responseMinutes(b) },
  { header: "buyer_name", value: (b) => b.buyer },
  { header: "buyer_email", value: (b) => b.buyerEmail },
  { header: "follow_up_opted_out", value: (b) => (b.optedOut ? "yes" : "no") },
  { header: "price_city", value: (b) => b.price.cityId },
  { header: "price_version", value: (b) => b.price.version },
  { header: "base_price_inr", value: (b) => rupees(b.price.basePricePaise) },
  { header: "road_tax_inr", value: (b) => rupees(b.price.roadTaxPaise) },
  { header: "insurance_inr", value: (b) => rupees(b.price.insurancePaise) },
  { header: "accessories_inr", value: (b) => rupees(b.price.accessoriesPaise) },
  { header: "on_road_price_inr", value: (b) => rupees(calculateOnRoadPrice(b.price)) },
  { header: "trade_in_model", value: (b) => b.tradeIn?.model ?? null },
  { header: "trade_in_year", value: (b) => b.tradeIn?.year ?? null },
  { header: "trade_in_km", value: (b) => b.tradeIn?.kilometres ?? null },
  { header: "trade_in_owners", value: (b) => b.tradeIn?.owners ?? null },
];

export function dmsRows(bookings: ExportBooking[]) {
  return {
    header: dmsColumns.map((column) => column.header),
    rows: bookings.map((booking) => dmsColumns.map((column) => column.value(booking))),
  };
}

function responseMinutes(booking: ExportBooking) {
  if (!booking.contactedAt) return null;
  return Math.max(0, Math.round((booking.contactedAt - booking.createdAt) / 60_000));
}

/** "2026-11-09 14:05" in India time: unambiguous and sortable in a spreadsheet. */
export function istDateTime(timestamp: number) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(timestamp);
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}`;
}

/** Start and end (exclusive) of one India calendar day, as epoch milliseconds. */
export function indiaDayRange(date: string) {
  const start = Date.parse(`${date}T00:00:00+05:30`);
  return { start, end: start + 24 * 60 * 60 * 1000 };
}
