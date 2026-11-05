import { MongoClient } from "mongodb";

const shared = globalThis as unknown as { mongoClient?: Promise<MongoClient> };

export function databaseName(): string {
  const name = process.env.MONGODB_DB_NAME?.trim();
  if (!name) throw new Error("Set MONGODB_DB_NAME in .env.");
  return name;
}

// Server and CLI infrastructure only; browser components must not import this file.
export function connectMongo(): Promise<MongoClient> {
  if (shared.mongoClient) return shared.mongoClient;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Set MONGODB_URI in .env.");
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });
  shared.mongoClient = client.connect().catch(async () => {
    shared.mongoClient = undefined;
    await client.close();
    throw new Error(
      "MongoDB connection failed. Check credentials and Atlas network access.",
    );
  });
  return shared.mongoClient;
}

export async function closeMongo(): Promise<void> {
  const pending = shared.mongoClient;
  shared.mongoClient = undefined;
  if (pending) await (await pending).close();
}
