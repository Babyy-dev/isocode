import "dotenv/config";
import { MongoClient } from "mongodb";

function collectSignals(
  error: unknown,
  depth = 0,
  signals = new Set<string>(),
): Set<string> {
  if (!error || typeof error !== "object" || depth > 6) return signals;
  const record = error as Record<string, unknown>;
  for (const key of ["name", "code"]) {
    const value = String(record[key] ?? "");
    if (/^[a-zA-Z0-9_]{1,60}$/.test(value)) signals.add(value);
  }
  // Report known categories, never the raw message, host, user or connection string.
  const message = String(record.message ?? "");
  if (/authentication failed|bad auth/i.test(message))
    signals.add("AUTHENTICATION_FAILED");
  if (/certificate|tls|ssl/i.test(message)) signals.add("TLS_OR_CERTIFICATE");
  collectSignals(record.cause, depth + 1, signals);
  collectSignals(record.error, depth + 1, signals);
  collectSignals(record.reason, depth + 1, signals);
  if (record.servers instanceof Map)
    for (const server of record.servers.values())
      collectSignals(server, depth + 1, signals);
  return signals;
}

async function diagnose() {
  const uri = process.env.MONGODB_URI;
  const database = process.env.MONGODB_DB_NAME?.trim();
  if (!uri || !database) {
    console.error(
      "Missing MONGODB_URI or MONGODB_DB_NAME in the root .env file.",
    );
    process.exitCode = 1;
    return;
  }
  let client: MongoClient | undefined;
  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    await client.connect();
    await client.db(database).command({ ping: 1 });
    console.info(
      "MongoDB ping succeeded. Next: npm run db:setup, then npm run db:seed.",
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed. Safe diagnostic signals:",
      [...collectSignals(error)].join(", ") || "Unknown",
    );
    console.error(
      "See README.md: MongoDB connection checklist. No credentials or hostnames were printed.",
    );
    process.exitCode = 1;
  } finally {
    await client?.close();
  }
}

void diagnose();
