import { runDatabaseTask } from "./database-task";
import { setupDatabase } from "./database-schema";
import { runMigrations } from "./migrations";

void runDatabaseTask(async (database) => {
  await setupDatabase(database);
  const migrated = await runMigrations(database);
  console.info(`Migrations: ${migrated.cars} cars' free-text inspections removed.`);
});
