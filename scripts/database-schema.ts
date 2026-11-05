import type { Db, Document } from "mongodb";

const amount = {
  bsonType: ["int", "long", "double"],
  minimum: 0,
  maximum: Number.MAX_SAFE_INTEGER,
  multipleOf: 1,
};
const string = { bsonType: "string" };
const date = { bsonType: "date" };
const optionalCarFields = {
  slug: string,
  description: { ...string, maxLength: 1500 },
  archived: { bsonType: "bool" },
  contentVersion: amount,
  updatedBy: string,
  colours: { bsonType: "array", maxItems: 12, items: string },
  photoUrls: { bsonType: "array", maxItems: 8, items: string },
  specifications: {
    bsonType: "array",
    maxItems: 20,
    items: {
      bsonType: "object",
      required: ["label", "value"],
      properties: { label: string, value: string },
    },
  },
  owners: {
    bsonType: ["null", "int", "long", "double"],
    minimum: 1,
    maximum: 20,
  },
  registrationMasked: string,
  inspection: {
    bsonType: ["null", "object"],
    required: ["inspectedOn", "checks"],
    properties: {
      inspectedOn: string,
      checks: {
        bsonType: "array",
        maxItems: 6,
        items: {
          bsonType: "object",
          required: ["area", "result", "note"],
          properties: {
            area: string,
            result: { enum: ["pass", "attention"] },
            note: { ...string, maxLength: 200 },
          },
        },
      },
    },
  },
};
const schemas = {
  cars: {
    ...optionalCarFields,
    _id: string,
    stockId: string,
    type: { enum: ["New", "Used"] },
    model: string,
    variant: string,
    fuel: { enum: ["Petrol", "Diesel"] },
    year: { ...amount, minimum: 1 },
    kilometres: amount,
    pricePaise: amount,
    status: { enum: ["Available", "Booked"] },
    createdAt: date,
    updatedAt: date,
  },
  cities: { _id: string, name: string },
  bookingLocks: { _id: string, revision: amount },
  consultantLinks: { _id: string, profile: string, updatedAt: date },
  bookingRateLimits: { _id: string, count: amount, expiresAt: date },
  aiRateLimits: { _id: string, count: amount, expiresAt: date },
  bookings: {
    _id: string,
    buyerId: string,
    carId: string,
    showroom: string,
    date: string,
    time: string,
    buyer: string,
    buyerEmail: string,
    needs: string,
    status: { enum: ["Confirmed", "Cancelled"] },
    consultant: string,
    createdAt: amount,
    contactedAt: { bsonType: ["null", "int", "long", "double"] },
    leadStatus: { enum: ["New", "Contacted", "Won", "Lost"] },
    optedOut: { bsonType: "bool" },
    consentAt: amount,
    consentVersion: { enum: ["booking-follow-up-v1"] },
    messages: {
      bsonType: "array",
      items: {
        bsonType: "object",
        required: ["kind", "channel", "template", "body", "status", "sentAt", "sentBy"],
        properties: {
          kind: { enum: ["acknowledgement", "reply"] },
          channel: { enum: ["WhatsApp", "SMS"] },
          template: { bsonType: ["null", "string"] },
          body: { ...string, maxLength: 2000 },
          status: { enum: ["simulated"] },
          sentAt: amount,
          sentBy: string,
        },
      },
    },
    price: {
      bsonType: "object",
      required: [
        "carId",
        "cityId",
        "version",
        "basePricePaise",
        "roadTaxPaise",
        "insurancePaise",
        "accessoriesPaise",
        "validThrough",
      ],
      properties: {
        carId: string,
        cityId: string,
        version: { ...amount, minimum: 1 },
        basePricePaise: amount,
        roadTaxPaise: amount,
        insurancePaise: amount,
        accessoriesPaise: amount,
        validThrough: string,
      },
    },
  },
  cityPrices: {
    _id: string,
    id: string,
    carId: string,
    cityId: string,
    version: { ...amount, minimum: 1 },
    basePricePaise: amount,
    roadTaxPaise: amount,
    insurancePaise: amount,
    accessoriesPaise: amount,
    validFrom: date,
    validUntil: date,
    createdAt: date,
  },
};

async function ensureCollection(
  database: Db,
  name: string,
  properties: Document,
) {
  const schema = {
    $jsonSchema: {
      bsonType: "object",
      required: Object.keys(properties).filter(
        (key) => name !== "cars" || !(key in optionalCarFields),
      ),
      properties,
    },
  };
  const validator =
    name === "cityPrices"
      ? { $and: [schema, { $expr: { $gt: ["$validUntil", "$validFrom"] } }] }
      : schema;
  const options = {
    validator,
    validationLevel: "strict",
    validationAction: "error",
  } as const;
  if (await database.listCollections({ name }).hasNext()) {
    await database.command({ collMod: name, ...options });
  } else {
    await database.createCollection(name, options);
  }
}

export async function setupDatabase(database: Db) {
  for (const [name, properties] of Object.entries(schemas)) {
    await ensureCollection(database, name, properties);
  }
  await database
    .collection("cars")
    .createIndex({ stockId: 1 }, { unique: true });
  await database.collection("cars").createIndex({ type: 1, status: 1 });
  await database
    .collection("cars")
    .createIndex(
      { slug: 1 },
      { unique: true, partialFilterExpression: { slug: { $type: "string" } } },
    );
  await database
    .collection("cities")
    .createIndex({ name: 1 }, { unique: true });
  await database
    .collection("cityPrices")
    .createIndex({ carId: 1, cityId: 1, version: 1 }, { unique: true });
  await database
    .collection("cityPrices")
    .createIndex({ carId: 1, cityId: 1, validFrom: -1, version: -1 });
  await database.collection("bookings").createIndex(
    { carId: 1, showroom: 1, date: 1, time: 1 },
    {
      unique: true,
      partialFilterExpression: { status: "Confirmed" },
      name: "confirmed_slot_unique",
    },
  );
  await database
    .collection("bookings")
    .createIndex({ buyerId: 1, createdAt: -1 });
  await database
    .collection("bookings")
    .createIndex({ consultant: 1, createdAt: -1 });
  await database
    .collection("bookingRateLimits")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await database
    .collection("aiRateLimits")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await database
    .collection("consultantLinks")
    .createIndex({ profile: 1 }, { unique: true });
  console.info(
    "Collections, validators and indexes configured. Existing documents were not deleted.",
  );
}
