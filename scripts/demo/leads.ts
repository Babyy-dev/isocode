import type { Db } from "mongodb";
import type { BookingDocument } from "../../src/features/bookings/types";
import type { CityPrice } from "../../src/features/pricing/types";
import type { CarDocument, CityPriceDocument } from "../../src/lib/mongodb/documents";
import { acknowledgementMessage } from "../../src/features/messaging/templates";
import { DEMO_CITY_ID, type DemoLead } from "./fixtures";

const MINUTE = 60_000;
const IST_OFFSET_MS = 330 * MINUTE;

type Buyer = { id: string; email: string };

/** Replaces each demo lead by its fixed id, so re-running resets the demo inbox. */
export async function resetDemoLeads(database: Db, leads: DemoLead[], buyer: Buyer) {
  const bookings = database.collection<BookingDocument>("bookings");
  const now = Date.now();
  for (const lead of leads) {
    const price = await priceSnapshot(database, lead.carId);
    const carName = await findCarName(database, lead.carId);
    const owner = lead.ownedByDemoBuyer ? buyer : syntheticBuyer(lead.id);
    const record = toBooking({ lead, owner, price, carName }, now);
    await bookings.replaceOne({ _id: lead.id }, record, { upsert: true });
  }
}

/** An owner id that matches no account, standing in for a buyer who enquired elsewhere. */
function syntheticBuyer(leadId: string): Buyer {
  return { id: `synthetic-${leadId}`, email: `${leadId}@demo.companya.test` };
}

async function findCarName(database: Db, carId: string) {
  const car = await database.collection<CarDocument>("cars").findOne({ _id: carId });
  if (!car) throw new Error(`Car ${carId} is missing. Run npm run db:seed first.`);
  return `${car.model} ${car.variant}`;
}

async function priceSnapshot(database: Db, carId: string): Promise<CityPrice> {
  const price = await database
    .collection<CityPriceDocument>("cityPrices")
    .findOne({ carId, cityId: DEMO_CITY_ID }, { sort: { version: -1 } });
  if (!price)
    throw new Error(`No ${DEMO_CITY_ID} price for ${carId}. Run npm run db:seed first.`);
  return {
    carId,
    cityId: DEMO_CITY_ID,
    version: price.version,
    basePricePaise: price.basePricePaise,
    roadTaxPaise: price.roadTaxPaise,
    insurancePaise: price.insurancePaise,
    accessoriesPaise: price.accessoriesPaise,
    validThrough: indiaDate(+price.validUntil - 1),
  };
}

type BookingParts = { lead: DemoLead; owner: Buyer; price: CityPrice; carName: string };

function toBooking({ lead, owner, price, carName }: BookingParts, now: number): BookingDocument {
  const createdAt = now - lead.ageMinutes * MINUTE;
  const date = indiaDate(now + lead.inDays * 24 * 60 * MINUTE);
  const contactedAt =
    lead.contactedAfterMinutes === null
      ? null
      : createdAt + lead.contactedAfterMinutes * MINUTE;
  return {
    _id: lead.id,
    buyerId: owner.id,
    buyerEmail: owner.email,
    carId: lead.carId,
    showroom: lead.showroom,
    date,
    time: lead.time,
    buyer: lead.buyer,
    needs: lead.needs,
    status: "Confirmed",
    consultant: lead.consultant,
    createdAt,
    contactedAt,
    leadStatus: lead.leadStatus,
    optedOut: lead.optedOut === true,
    tradeIn: lead.tradeIn ?? null,
    aiConsent: true,
    aiConsentAt: createdAt,
    consentAt: createdAt,
    consentVersion: "booking-follow-up-v1",
    price,
    messages: [acknowledgementMessage({ ...lead, date, carName }, createdAt)],
  };
}

function indiaDate(timestamp: number) {
  return new Date(timestamp + IST_OFFSET_MS).toISOString().slice(0, 10);
}
