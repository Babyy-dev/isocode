import type { Db, ObjectId } from "mongodb";
import { getAuth } from "../../src/features/auth/server";
import type { ConsultantLink } from "../../src/features/leads/repository";
import { DEMO_PASSWORD, type DemoAccount } from "./fixtures";

/** Creates (or reuses) each account, then applies its role and consultant link. Returns email → user id. */
export async function ensureDemoAccounts(database: Db, accounts: DemoAccount[]) {
  const ids = new Map<string, string>();
  for (const account of accounts) {
    const userId = await ensureUser(database, account);
    await applyProfile(database, userId, account);
    const id = userId.toString();
    if (account.profile) await linkProfile(database, id, account.profile);
    ids.set(account.email, id);
  }
  return ids;
}

async function ensureUser(database: Db, account: DemoAccount) {
  const existing = await findUser(database, account.email);
  if (existing) return existing;
  // Server-side API: same password hashing and validation as the sign-up form.
  const auth = await getAuth();
  await auth.api.signUpEmail({
    body: { email: account.email, password: DEMO_PASSWORD, name: account.name },
  });
  const created = await findUser(database, account.email);
  if (!created) throw new Error(`Demo account was not created: ${account.email}`);
  return created;
}

async function findUser(database: Db, email: string) {
  const user = await database
    .collection<{ _id: ObjectId }>("user")
    .findOne({ email }, { projection: { _id: 1 } });
  return user?._id ?? null;
}

/** Role and display name are reset on every run so the demo stays predictable. */
async function applyProfile(database: Db, userId: ObjectId, account: DemoAccount) {
  await database.collection<{ _id: ObjectId }>("user").updateOne(
    { _id: userId },
    { $set: { role: account.role, name: account.name, updatedAt: new Date() } },
  );
}

async function linkProfile(database: Db, userId: string, profile: string) {
  const links = database.collection<ConsultantLink>("consultantLinks");
  const holder = await links.findOne({ profile });
  if (holder && holder._id !== userId)
    throw new Error(
      `Profile "${profile}" is already linked to another account. Unlink it before seeding demo accounts.`,
    );
  await links.updateOne(
    { _id: userId },
    { $set: { profile, updatedAt: new Date() } },
    { upsert: true },
  );
}
