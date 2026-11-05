import { runDatabaseTask } from "./database-task";

void runDatabaseTask(async (database) => {
  await database.command({ ping: 1 });
  console.info("MongoDB connection verified.");
});
