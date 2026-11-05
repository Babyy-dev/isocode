import { runDatabaseTask } from "./database-task";

const [email, role] = process.argv.slice(2);

if (!email || !["buyer", "consultant", "admin"].includes(role)) {
  console.error(
    "Usage: npm run auth:role -- <registered-email> <buyer|consultant|admin>",
  );
  process.exitCode = 1;
} else {
  void runDatabaseTask(async (database) => {
    const result = await database
      .collection("user")
      .updateOne(
        { email: email.trim().toLowerCase() },
        { $set: { role, updatedAt: new Date() } },
      );
    if (result.matchedCount !== 1)
      throw new Error("Register the account before assigning a role.");
    console.info(
      "User role updated. Subsequent requests check the current database role.",
    );
  });
}
