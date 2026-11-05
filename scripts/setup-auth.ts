import { runDatabaseTask } from "./database-task";

void runDatabaseTask(async (database) => {
  await database.collection("user").createIndex({ email: 1 }, { unique: true });
  await database
    .collection("session")
    .createIndex({ token: 1 }, { unique: true });
  await database.collection("session").createIndex({ userId: 1 });
  await database
    .collection("session")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await database
    .collection("account")
    .createIndex({ providerId: 1, accountId: 1 }, { unique: true });
  await database.collection("account").createIndex({ userId: 1 });
  await database.collection("verification").createIndex({ identifier: 1 });
  await database
    .collection("verification")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await database
    .collection("rateLimit")
    .createIndex({ key: 1 }, { unique: true });
  console.info(
    "Better Auth indexes configured. No users or roles were changed.",
  );
});
