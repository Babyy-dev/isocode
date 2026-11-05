import "server-only";
import { connectMongo, databaseName } from "./mongodb/client";

export async function getDatabase() {
  const client = await connectMongo();
  return client.db(databaseName());
}
