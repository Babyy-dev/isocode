import type { Db } from "mongodb";
import type { BookingDocument } from "../../src/features/bookings/types";
import type { CityPrice } from "../../src/features/pricing/types";
import type { CityPriceDocument } from "../../src/lib/mongodb/documents";
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
    const owner = lead.ownedByDemoBuyer ? buyer : syntheticBuyer(lead.id);
    const record = toBooking(lead, owner, price, now);
    await bookings.replaceOne({ _id: lead.id }, record, { upsert: true });
  }
}

/** An owner id that matches no account, standing in for a buyer who enquired elsewhere. */
function syntheticBuyer(leadId: string): Buyer {
  return { id: `synthetic-${leadId}`, email: `${leadId}@demo.companya.test` };
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

function toBooking(
  lead: DemoLead,
  buyer: Buyer,
  price: CityPrice,
  now: number,
): BookingDocument {
  const createdAt = now - lead.ageMinutes * MINUTE;
  const contactedAt =
    lead.contactedAfterMinutes === null
      ? null
      : createdAt + lead.contactedAfterMinutes * MINUTE;
  return {
    _id: lead.id,
    buyerId: buyer.id,
    buyerEmail: buyer.email,
    carId: lead.carId,
    showroom: lead.showroom,
    date: indiaDate(now + lead.inDays * 24 * 60 * MINUTE),
    time: lead.time,
    buyer: lead.buyer,
    needs: lead.needs,
    status: "Confirmed",
    consultant: lead.consultant,
    createdAt,
    contactedAt,
    leadStatus: lead.leadStatus,
    optedOut: lead.optedOut === true,
    aiConsent: true,
    aiConsentAt: createdAt,
    consentAt: createdAt,
    consentVersion: "booking-follow-up-v1",
    price,
    messages: [
      `Simulated acknowledgement: test drive confirmed. Assigned to ${lead.consultant}. No SMS or WhatsApp sent.`,
    ],
  };
}

function indiaDate(timestamp: number) {
  return new Date(timestamp + IST_OFFSET_MS).toISOString().slice(0, 10);
}
