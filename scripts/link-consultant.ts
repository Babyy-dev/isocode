import { demoConsultants } from "../src/features/demo/data";
import { runDatabaseTask } from "./database-task";

const [email, profile] = process.argv.slice(2);
if (
  !email ||
  !profile ||
  !demoConsultants.some((person) => person.name === profile)
) {
  console.error(
    'Usage: npm run auth:link-consultant -- registered-email "Consultant 1A"',
  );
  process.exitCode = 1;
} else {
  void runDatabaseTask(async (database) => {
    const user = await database
      .collection("user")
      .findOne({ email: email.trim().toLowerCase(), role: "consultant" });
    if (!user)
      throw new Error(
        "Register the account and assign the consultant role first.",
      );
    // A profile belongs to one account; collisions fail rather than transferring access silently.
    await database
      .collection("consultantLinks")
      .createIndex({ profile: 1 }, { unique: true });
    await database
      .collection<{
        _id: string;
        profile: string;
        updatedAt: Date;
      }>("consultantLinks")
      .updateOne(
        { _id: user._id.toString() },
        { $set: { profile, updatedAt: new Date() } },
        { upsert: true },
      );
    console.info(
      "Consultant account linked. No role or other account was changed.",
    );
  });
}
