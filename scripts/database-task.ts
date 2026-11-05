import "dotenv/config";
import type { Db } from "mongodb";
import {
  closeMongo,
  connectMongo,
  databaseName,
} from "../src/lib/mongodb/client";

export async function runDatabaseTask(task: (database: Db) => Promise<void>) {
  try {
    const name = databaseName();
    const client = await connectMongo();
    await task(client.db(name));
  } catch (error) {
    console.error(
      "Database task failed. Check MONGODB_URI, MONGODB_DB_NAME, database permissions and Atlas network access. Credentials were not logged.",
    );
    console.error(`Cause: ${describeError(error)}`);
    process.exitCode = 1;
  } finally {
    await closeMongo();
  }
}

// Error class and code only: driver messages can echo connection details.
function describeError(error: unknown) {
  if (!(error instanceof Error)) return "unknown error";
  const code = (error as { code?: unknown; codeName?: unknown }).codeName ??
    (error as { code?: unknown }).code;
  return code ? `${error.name} (${String(code)})` : error.name;
}
